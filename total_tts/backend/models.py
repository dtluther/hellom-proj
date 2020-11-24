from django.db import models

# Create your models here.
class TtsEntry(models.Model):
    customer_number = models.IntegerField()
    day_part = models.IntegerField()
    first_seen_local = models.IntegerField()
    first_seen_utc = models.IntegerField()
    misc_id = models.IntegerField()
    location = models.IntegerField()
    model_id = models.IntegerField()
    total_time_to_service = models.IntegerField()

    @classmethod
    def average_tts(cls):
        # https://micropyramid.com/blog/aggregation-in-django-minumum-and-maximum-values-from-django-model/
        return cls.objects.all().aggregate(models.Avg('total_time_to_service'))

