from django.db import models

class ExpertDecisionMatrix(models.Model):
    expert_name = models.CharField(max_length=100)
    session_key = models.CharField(max_length=100, null=True)
    alternatives = models.JSONField()
    criteria = models.JSONField()
    values = models.JSONField()
    scale = models.CharField(max_length=10, default = '3')

class Alternative(models.Model):
    name = models.CharField(max_length=100)

class Criterion(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=1)
    l = models.FloatField()
    m = models.FloatField()
    u = models.FloatField()


def __str__(self):
    return self.expert_name
