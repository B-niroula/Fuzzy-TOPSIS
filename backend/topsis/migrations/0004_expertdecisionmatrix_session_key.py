# Generated by Django 4.2 on 2023-04-22 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topsis', '0003_expertdecisionmatrix_scale'),
    ]

    operations = [
        migrations.AddField(
            model_name='expertdecisionmatrix',
            name='session_key',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
