from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='skill',
            name='tags',
            field=models.CharField(blank=True, help_text='Comma-separated tags', max_length=500),
        ),
    ]
