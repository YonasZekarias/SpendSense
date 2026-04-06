import csv
from collections import defaultdict
from datetime import date
from decimal import Decimal
from io import StringIO

from django.db.models import Sum
from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Expense
from .serializers import BudgetSerializer, ExpenseSerializer


class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).prefetch_related('categories').order_by('-year', '-month')


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).prefetch_related('categories')


class BudgetSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = int(request.query_params.get('month', 1))
        year = int(request.query_params.get('year', date.today().year))

        hints = {
            '0-5000': Decimal('5000'),
            '5000-10000': Decimal('10000'),
            '10000-20000': Decimal('20000'),
            '20000+': Decimal('35000'),
        }
        total = hints.get(user.income_bracket or '', Decimal('12000'))
        if user.household_size and user.household_size > 4:
            total *= Decimal('1.15')

        cats = [
            {'category_name': 'Food', 'limit_amount': (total * Decimal('0.45')).quantize(Decimal('0.01'))},
            {'category_name': 'Transport', 'limit_amount': (total * Decimal('0.15')).quantize(Decimal('0.01'))},
            {'category_name': 'Utilities', 'limit_amount': (total * Decimal('0.15')).quantize(Decimal('0.01'))},
            {'category_name': 'Other', 'limit_amount': (total * Decimal('0.25')).quantize(Decimal('0.01'))},
        ]
        return Response({
            'month': month,
            'year': year,
            'suggested_total': str(total),
            'categories': [{'category_name': c['category_name'], 'limit_amount': str(c['limit_amount'])} for c in cats],
        })


class BudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            budget = Budget.objects.prefetch_related('categories').get(pk=pk, user=request.user)
        except Budget.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        expenses = Expense.objects.filter(
            user=request.user,
            date__year=budget.year,
            date__month=budget.month,
        )
        spent_total = expenses.aggregate(s=Sum('amount'))['s'] or Decimal('0')
        spent_by = defaultdict(lambda: Decimal('0'))
        for e in expenses:
            spent_by[e.category] += e.amount

        by_category = []
        warn_total_80 = False
        warn_total_100 = False
        pct_total = Decimal('0')
        if budget.total_limit > 0:
            pct_total = spent_total / budget.total_limit * 100
            warn_total_80 = pct_total >= Decimal('80')
            warn_total_100 = pct_total >= Decimal('100')

        for bc in budget.categories.all():
            lim = bc.limit_amount
            sp = spent_by.get(bc.category_name, Decimal('0'))
            pct = (sp / lim * 100) if lim > 0 else Decimal('0')
            by_category.append({
                'category_name': bc.category_name,
                'limit_amount': str(lim),
                'spent': str(sp),
                'remaining': str(lim - sp),
                'percent_used': float(round(pct, 2)),
                'warning_80': pct >= 80,
                'warning_100': pct >= 100,
            })

        return Response({
            'budget_id': budget.id,
            'month': budget.month,
            'year': budget.year,
            'total_limit': str(budget.total_limit),
            'total_spent': str(spent_total),
            'remaining': str(budget.total_limit - spent_total),
            'percent_total_used': float(round(pct_total, 2)),
            'warning_total_80': warn_total_80,
            'warning_total_100': warn_total_100,
            'by_category': by_category,
        })


class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user).order_by('-date', '-id')
        category = self.request.query_params.get('category')
        df = self.request.query_params.get('date_from')
        dt = self.request.query_params.get('date_to')
        if category:
            qs = qs.filter(category__iexact=category)
        if df:
            qs = qs.filter(date__gte=df)
        if dt:
            qs = qs.filter(date__lte=dt)
        return qs


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class FinanceExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('format', 'csv').lower()
        month = int(request.query_params.get('month', 0))
        year = int(request.query_params.get('year', 0))

        qs = Expense.objects.filter(user=request.user).order_by('-date')
        if month and year:
            qs = qs.filter(date__month=month, date__year=year)

        if fmt == 'pdf':
            return Response(
                {'detail': 'PDF export is not implemented yet. Use format=csv.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        buffer = StringIO()
        w = csv.writer(buffer)
        w.writerow(['id', 'category', 'amount', 'date', 'note', 'payment_method'])
        for e in qs:
            w.writerow([e.id, e.category, e.amount, e.date.isoformat(), e.note or '', e.payment_method or ''])

        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = f'attachment; filename="spendsense_expenses_{year or "all"}_{month or "all"}.csv"'
        return resp
