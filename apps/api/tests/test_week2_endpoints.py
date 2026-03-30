"""
Smoke tests for Week 1–2 backend tasks (REST API).
Run: python manage.py test tests.test_week2_endpoints -v 2
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from market.models import Item, PriceSubmission
from users.models import Vendor

User = get_user_model()


class Week2EndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.item = Item.objects.create(name='Teff', category='Food', unit='kg')
        self.user = User.objects.create_user(
            email='shopper@test.com',
            full_name='Shopper',
            password='testpass123',
        )
        self.admin = User.objects.create_user(
            email='admin@test.com',
            full_name='Admin',
            password='testpass123',
            role='admin',
        )
        self.vendor_user = User.objects.create_user(
            email='vendor@test.com',
            full_name='Vendor User',
            password='testpass123',
        )
        self.vendor = Vendor.objects.create(
            owner=self.vendor_user,
            shop_name='Test Shop',
            city='Adama',
            is_verified=True,
        )

    def test_items_list_and_detail(self):
        r = self.client.get('/api/market/items/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data), 1)
        r2 = self.client.get(f'/api/market/items/{self.item.id}/')
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(r2.data['name'], 'Teff')

    def test_register_login_me(self):
        r = self.client.post(
            '/api/users/register/',
            {
                'full_name': 'New',
                'email': 'new@test.com',
                'password': 'newpass12345',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        r = self.client.post(
            '/api/auth/token/',
            {'email': 'new@test.com', 'password': 'newpass12345'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('access', r.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        r = self.client.get('/api/users/me/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['email'], 'new@test.com')

    def test_price_submit_and_averages(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(
            '/api/market/prices/submit/',
            {
                'item_id': self.item.id,
                'price_value': '50.00',
                'market_location': 'Merkato',
                'city': 'Addis Ababa',
                'date_observed': '2026-03-01',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['status'], 'pending')
        r = self.client.get('/api/market/prices/averages/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_trends_forecasts_inflation(self):
        PriceSubmission.objects.create(
            user=self.user,
            item=self.item,
            price_value=Decimal('40.00'),
            market_location='M',
            city='Addis Ababa',
            date_observed='2026-03-01',
            status='approved',
        )
        r = self.client.get('/api/market/trends/', {'item_id': self.item.id})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(len(r.data) >= 1)
        r = self.client.get('/api/market/forecasts/', {'item_id': self.item.id})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        r = self.client.get('/api/market/inflation/', {'period': 'month'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_submissions_requires_admin(self):
        r = self.client.get('/api/market/admin/submissions/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/market/admin/submissions/')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(user=self.admin)
        r = self.client.get('/api/market/admin/submissions/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_finance_budget_and_expense(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/finance/budgets/suggestions/', {'month': '3', 'year': '2026'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        r = self.client.post(
            '/api/finance/budgets/',
            {
                'month': 3,
                'year': 2026,
                'total_limit': '10000.00',
                'categories': [
                    {'category_name': 'Food', 'limit_amount': '5000.00'},
                    {'category_name': 'Transport', 'limit_amount': '2000.00'},
                ],
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        bid = r.data['id']
        r = self.client.get(f'/api/finance/budgets/{bid}/summary/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        r = self.client.post(
            '/api/finance/expenses/',
            {
                'category': 'Food',
                'amount': '100.00',
                'date': '2026-03-15',
                'description': 'test',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_ecommerce_recommendations_and_purchase(self):
        from market.models import VendorPrice

        VendorPrice.objects.create(vendor=self.vendor, item=self.item, price=Decimal('45.00'))
        self.client.force_authenticate(user=self.user)
        r = self.client.get(
            '/api/ecommerce/recommendations/',
            {'item_id': self.item.id, 'city': 'Adama'},
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        vp_id = VendorPrice.objects.get(vendor=self.vendor, item=self.item).id
        r = self.client.post(
            '/api/ecommerce/purchases/',
            {
                'vendor_id': str(self.vendor.id),
                'listing_id': vp_id,
                'quantity': 2,
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['status'], 'pending')

    def test_admin_users_list(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.get('/api/users/admin/users/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
