"""
Market-app Django signals.

Handles:
1. Submission status change → notify the submitter when approved/rejected.
2. Price alert check → when a submission is approved, check all active
   PriceAlerts for matching items and notify users whose target is met.
"""

import logging
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Avg
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone

from users.notification_utils import create_notification

from .models import PriceAlert, PriceSubmission

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=PriceSubmission)
def on_submission_status_change(sender, instance, **kwargs):
    """When an admin approves or rejects a submission, notify the submitter."""
    if instance.pk is None:
        # New object — nothing to compare against.
        return

    try:
        old = PriceSubmission.objects.get(pk=instance.pk)
    except PriceSubmission.DoesNotExist:
        return

    if old.status == instance.status:
        return  # No status change.

    # --- Approved ---
    if instance.status == 'approved':
        create_notification(
            user=instance.user,
            notification_type='submission_status',
            message=(
                f'Your price submission for "{instance.item.name}" '
                f'(ETB {instance.price_value}) has been approved. '
                f'Thank you for contributing!'
            ),
            metadata={
                'submission_id': instance.pk,
                'item_id': instance.item_id,
                'item_name': instance.item.name,
                'status': 'approved',
            },
        )
        # After approval, check price alerts.
        _check_price_alerts_for_item(instance.item, instance.city)

    # --- Rejected ---
    elif instance.status == 'rejected':
        reason = instance.rejection_reason or 'No reason provided.'
        create_notification(
            user=instance.user,
            notification_type='submission_status',
            message=(
                f'Your price submission for "{instance.item.name}" '
                f'(ETB {instance.price_value}) was rejected. '
                f'Reason: {reason}'
            ),
            metadata={
                'submission_id': instance.pk,
                'item_id': instance.item_id,
                'item_name': instance.item.name,
                'status': 'rejected',
                'reason': reason,
            },
        )


def _check_price_alerts_for_item(item, city: str):
    """Check all active price alerts for the given item and notify if target is met."""
    # Current average price for the item (and optionally city).
    avg_qs = PriceSubmission.objects.filter(
        item=item,
        status='approved',
        date_observed__gte=date.today() - timedelta(days=30),
    )
    if city:
        city_avg = avg_qs.filter(city__iexact=city).aggregate(a=Avg('price_value'))['a']
    else:
        city_avg = None

    national_avg = avg_qs.aggregate(a=Avg('price_value'))['a']

    if national_avg is None and city_avg is None:
        return

    # Fetch active alerts for this item.
    alerts = PriceAlert.objects.filter(
        item=item,
        is_active=True,
    ).select_related('user', 'item')

    for alert in alerts:
        # Choose the relevant average: city-specific if alert.city matches,
        # otherwise national.
        if alert.city and city and alert.city.lower() == city.lower() and city_avg is not None:
            current_price = city_avg
        elif national_avg is not None:
            current_price = national_avg
        else:
            continue

        if Decimal(str(current_price)) <= alert.target_price:
            create_notification(
                user=alert.user,
                notification_type='price_alert',
                message=(
                    f'Price alert! "{item.name}" is now at '
                    f'ETB {round(current_price, 2)}, '
                    f'meeting your target of ETB {alert.target_price}.'
                ),
                metadata={
                    'alert_id': alert.pk,
                    'item_id': item.pk,
                    'item_name': item.name,
                    'current_price': str(round(current_price, 2)),
                    'target_price': str(alert.target_price),
                    'city': alert.city or 'national',
                },
            )
            # Mark alert as triggered (deactivate).
            alert.is_active = False
            alert.triggered_at = timezone.now()
            alert.save(update_fields=['is_active', 'triggered_at'])
