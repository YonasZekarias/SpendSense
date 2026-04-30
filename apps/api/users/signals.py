import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification)
def push_notification_to_realtime(sender, instance, created, **kwargs):
    if not created:
        return
    base = getattr(settings, "REALTIME_INTERNAL_URL", "") or ""
    token = getattr(settings, "REALTIME_INTERNAL_TOKEN", "")
    if not base:
        return
    url = f"{base.rstrip('/')}/internal/emit"
    event_name = {
        "budget_warning": "budget_warning",
        "price_spike": "price_spike_alert",
        "vendor_deal": "vendor_deal",
        "delivery_update": "delivery_update",
        "payment": "payment_confirmation",
    }.get(instance.type, "notification")

    payload = json.dumps(
        {
            "userId": str(instance.user_id),
            "event": event_name,
            "payload": {
                "id": instance.id,
                "type": instance.type,
                "message": instance.message,
                "created_at": instance.created_at.isoformat() if instance.created_at else None,
            },
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-Internal-Token": token,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status >= 400:
                logger.warning("Realtime emit returned %s", resp.status)
    except urllib.error.URLError as e:
        logger.debug("Realtime emit skipped: %s", e)
