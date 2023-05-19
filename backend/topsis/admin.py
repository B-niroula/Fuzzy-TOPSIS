from django.contrib import admin
from .models import ExpertDecisionMatrix
from .models import Alternative, Criterion

admin.site.register(ExpertDecisionMatrix)
admin.site.register(Alternative)
admin.site.register(Criterion)