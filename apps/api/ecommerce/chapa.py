from decimal import Decimal
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


class ChapaInitError(Exception):
    pass


def initialize_chapa_checkout(*, tx_ref, amount, email, first_name='SpendSense', last_name='User'):
    """
    Initialize Chapa checkout and return checkout_url.
    Uses mock URL when CHAPA_USE_MOCK=true or no secret key is configured.
    """
    if settings.CHAPA_USE_MOCK or not settings.CHAPA_SECRET_KEY:
        return f'https://checkout.chapa.co/checkout/mock?tx_ref={tx_ref}'

    payload = {
        'amount': str(Decimal(amount)),
        'currency': 'ETB',
        'email': email,
        'first_name': first_name or 'SpendSense',
        'last_name': last_name or 'User',
        'tx_ref': tx_ref,
        'callback_url': settings.CHAPA_CALLBACK_URL,
        'return_url': settings.CHAPA_RETURN_URL,
        'customization[title]': 'SpendSense Checkout',
        'customization[description]': 'Smart shopping order payment',
    }
    headers = {
        'Authorization': f'Bearer {settings.CHAPA_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    req = Request(
        settings.CHAPA_INIT_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST',
    )
    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise ChapaInitError(f'Chapa initialization failed: {exc}') from exc

    checkout_url = (
        data.get('data', {}).get('checkout_url')
        or data.get('checkout_url')
    )
    if not checkout_url:
        raise ChapaInitError(f'Chapa response missing checkout_url: {data}')
    return checkout_url
