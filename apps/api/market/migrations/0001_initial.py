# Generated manually for market app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, unique=True)),
                ('category', models.CharField(max_length=100)),
                ('unit', models.CharField(max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='PriceSubmission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price_value', models.DecimalField(decimal_places=2, max_digits=10)),
                ('market_location', models.CharField(max_length=120)),
                ('city', models.CharField(max_length=120)),
                ('date_observed', models.DateField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='market.item')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
        ),
        migrations.CreateModel(
            name='NationalPrice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('source', models.CharField(choices=[('crowdsourced', 'Crowdsourced'), ('official', 'Official')], max_length=20)),
                ('city', models.CharField(max_length=120)),
                ('date', models.DateField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='market.item')),
            ],
        ),
        migrations.CreateModel(
            name='Forecast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('forecast_date', models.DateField()),
                ('predicted_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('model_used', models.CharField(max_length=50)),
                ('confidence_low', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('confidence_high', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='market.item')),
            ],
        ),
        migrations.CreateModel(
            name='VendorPrice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date', models.DateField(auto_now_add=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='market.item')),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.vendor')),
            ],
        ),
    ]
