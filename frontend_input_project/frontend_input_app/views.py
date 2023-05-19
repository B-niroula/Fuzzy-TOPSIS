from django.shortcuts import render
from django.contrib import messages
import requests


def index(request):
    if request.method == "POST":
        if f'alternative_0' in request.POST:
            #handle form submission
            project_name = request.POST['project-name']
            num_alternatives = int(request.POST['num_alternatives'])
            num_criteria = int(request.POST['num_criteria'])

            #Send a POST request with the data to the backend_microservice
            backend_url = "http://127.0.0.1:8000/topsis/receive-data/"
            data = {
                "project_name": project_name,
                "num_alternatives": num_alternatives,
                "num_criteria": num_criteria,
                "alternatives": [],
                "criteria": []
            }

            # Add alternatives and criteria to the data dictionary
            for alt in Alternative.objects.filter(project=project):
                data["alternatives"].append({"name": alt.name})

            for crit in Criterion.objects.filter(project=project):
                data["criteria"].append({
                    "name": crit.name,
                    "type": crit.type,
                    "l": crit.l,
                    "m": crit.m,
                    "u": crit.u
                })

            response = requests.post(backend_url, json=data)

            # Check the response status and display a message accordingly
            if response.status_code == 200:
                messages.success(request, "Data sent successfully.")
            else:
                messages.error(request, "Error sending data.")

    else:
        # Display an error message
        messages.error(request, "Please create the alternatives and criteria tables before submitting the form.")

    return render(request, 'index.html')

# def topsis_result(request):
    # Replace this URL with the URL of your backend_microservice
    #backend_microservice_url = "http://localhost:8000/calculate_topsis/"
    #response = requests.get(backend_microservice_url)
    #topsis_result = response.json().get("results", "Error: Unable to fetch results.")
    #return render(request, "topsis_result.html", {"topsis_result": topsis_result})
    #return render(request,'topsis_result.html')