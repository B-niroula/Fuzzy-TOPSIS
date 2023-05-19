from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .models import ExpertDecisionMatrix
from topsis.models import Alternative, Criterion
from django.views.decorators.csrf import csrf_exempt
import json
from .scale_table import scaleTable

@api_view(['POST'])
def receive_data(request):
    data = request.data
    print("Received data from frontend:", data)

    # Check if an ExpertDecisionMatrix instance with the given expert_name already exists
    expert_decision_matrix, created = ExpertDecisionMatrix.objects.get_or_create(
        expert_name=data['expert_name'],
        defaults={
            'session_key': request.session.session_key,
            'alternatives': data['decision_matrix_data']['alternatives'],
            'criteria': data['decision_matrix_data']['criteria'],
            'values': data['decision_matrix_data']['values'],
            'scale': data['decision_matrix_data']['scale']
        }
    )

    # Update the existing entry if it was not created
    if not created:
        expert_decision_matrix.alternatives = data['decision_matrix_data']['alternatives']
        expert_decision_matrix.criteria = data['decision_matrix_data']['criteria']
        expert_decision_matrix.values = data['decision_matrix_data']['values']
        expert_decision_matrix.scale = data['decision_matrix_data']['scale']
        expert_decision_matrix.save()


    response = {
        "status": "success",
        "message": "Data received successfully",
    }
    return JsonResponse(response)

@csrf_exempt
def receive_page2_data(request):
    if request.method == 'POST':
        received_data = json.loads(request.body)
        print('Received data:', received_data)
        
        # Save the received data to the database
        alternatives = received_data['alternatives']
        criteria = received_data['criteria']

        for alt in alternatives:
            Alternative.objects.create(name=alt)

        for crit in criteria:
            Criterion.objects.create(
                name=crit['name'],
                type=crit['type'],
                l=crit['l'],
                m=crit['m'],
                u=crit['u']
            )
        
        # Send a response back to the frontend
        response_data = {'message': 'Data received successfully'}
        return JsonResponse(response_data)
    else:
        return JsonResponse({'error': 'Invalid request method'})
        
@api_view(['POST'])
def delete_expert(request):
    expert_name = request.data.get('expert_name')

    if not expert_name:
        return JsonResponse({"status": "failure", "message": "No expert name provided"})

    try:
        expert_decision_matrix = ExpertDecisionMatrix.objects.get(expert_name=expert_name)
        expert_decision_matrix.delete()
        return JsonResponse({"status": "success", "message": f"Expert '{expert_name}' deleted"})
    except ExpertDecisionMatrix.DoesNotExist:
        return JsonResponse({"status": "failure", "message": f"Expert '{expert_name}' not found"})

@csrf_exempt
def mean_of_experts(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        expert_names = data.get('expert_names', [])

        if not expert_names:
            return JsonResponse({'error': 'No expert names provided'})

        experts = ExpertDecisionMatrix.objects.filter(expert_name__in=expert_names)

        if not experts:
            return JsonResponse({'error': 'No experts found'})

        num_experts = len(experts)
        num_alternatives = len(experts[0].alternatives)
        num_criteria = len(experts[0].criteria)

        # Initialize mean_values with zeros
        mean_values = [[{"l": 0, "m": 0, "u": 0} for _ in range(num_criteria)] for _ in range(num_alternatives)]

        print("Experts:", experts) # test

        # Calculate the sum of values for each cell
        for expert in experts:
            values = expert.values
            scale = int(expert.scale)
            print("Expert:", expert.expert_name, "Scale:", scale, "Values:", values) # test
            for i, row in enumerate(values):
                for j, value in enumerate(row):
                    scale_value = scaleTable[scale][value - 1]  # Get L, M, and U values from scaleTable
                    mean_values[i][j]["l"] += scale_value["l"]
                    mean_values[i][j]["m"] += scale_value["m"]
                    mean_values[i][j]["u"] += scale_value["u"]

        for i, row in enumerate(mean_values):
            for j, value in enumerate(row):
                print("mean values", mean_values[i][j]["l"], mean_values[i][j]["m"], mean_values[i][j]["u"])

        # Calculate the mean
        for i, row in enumerate(mean_values):
            for j, value in enumerate(row):
                mean_values[i][j]["l"] /= num_experts
                mean_values[i][j]["m"] /= num_experts
                mean_values[i][j]["u"] /= num_experts

        # Return the mean_values in a dictionary format
        response = {
            'mean_values': mean_values,
            'alternatives': experts[0].alternatives,
            'criteria': experts[0].criteria
        }

        return JsonResponse(response)

    return JsonResponse({'error': 'Invalid request method'})

@csrf_exempt
def normalize_decision_matrix(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        expert_names = data.get('expert_names', [])
        criteria_types = data.get('criteria_types', [])
        criterion_weights = data.get('criterion_weights', [])


        print("Data received:", data)  #test1

        
        if not expert_names or not criteria_types:
            return JsonResponse({'error': 'Expert names or criteria types not provided'})

        experts = ExpertDecisionMatrix.objects.filter(expert_name__in=expert_names)

        if not experts:
            return JsonResponse({'error': 'No experts found'})

        if not criterion_weights:
            return JsonResponse({'error': 'Criterion weights not provided'})


        criteria = experts[0].criteria
        criteria_objects = Criterion.objects.filter(name__in=criteria)

        print("Criteria:", criteria)
        print("Criteria Objects:", criteria_objects)

        #criteria_types = [crit.type for crit in criteria_objects]
        print("criteria_types", criteria_types);


        print("Befor num experts");

        num_experts = len(experts)
        num_alternatives = len(experts[0].alternatives)
        num_criteria = len(experts[0].criteria)

        # Calculate mean_values (fuzzy decision matrix)
        mean_values = [[{"l": 0, "m": 0, "u": 0} for _ in range(num_criteria)] for _ in range(num_alternatives)]
        smallConstant = int (10**(-10))
        for expert in experts:
            values = expert.values
            scale = int(expert.scale)
            for i, row in enumerate(values):
                for j, value in enumerate(row):
                    scale_value = scaleTable[scale][value - 1]
                    mean_values[i][j]["l"] += scale_value["l"]
                    mean_values[i][j]["m"] += scale_value["m"]
                    mean_values[i][j]["u"] += scale_value["u"]

        for i, row in enumerate(mean_values):
            for j, value in enumerate(row):
                mean_values[i][j]["l"] /= num_experts
                mean_values[i][j]["m"] /= num_experts
                mean_values[i][j]["u"] /= num_experts

        print("Before normalization loop") 

        # Normalize the fuzzy decision matrix
        normalized_decision_matrix = [[(0, 0, 0) for _ in range(num_criteria)] for _ in range(num_alternatives)]

        for j, criteria_type in enumerate(criteria_types):
            if criteria_type == "+":  # benefit criteria
                max_cij = max(mean_values[i][j]["u"] for i in range(num_alternatives))
                for i in range(num_alternatives):
                    aij, bij, cij = mean_values[i][j]["l"], mean_values[i][j]["m"], mean_values[i][j]["u"]
                    normalized_decision_matrix[i][j] = (aij / (max_cij + smallConstant), bij / (max_cij + smallConstant), cij / (max_cij + smallConstant))
            elif criteria_type == "-":  # cost criteria
                min_aij = min(mean_values[i][j]["l"] for i in range(num_alternatives))
                for i in range(num_alternatives):
                    aij, bij, cij = mean_values[i][j]["l"], mean_values[i][j]["m"], mean_values[i][j]["u"]
                    normalized_decision_matrix[i][j] = (min_aij / (cij + smallConstant), min_aij / (bij + smallConstant), min_aij / (aij + smallConstant))

        # Calculate the weighted normalized decision matrix
        weighted_normalized_decision_matrix = [[(0, 0, 0) for _ in range(num_criteria)] for _ in range(num_alternatives)]

        for i in range(num_alternatives):
            for j in range(num_criteria):
                aij, bij, cij = normalized_decision_matrix[i][j]
                wj_l, wj_m, wj_u = criterion_weights[j]["l"], criterion_weights[j]["m"], criterion_weights[j]["u"]
                weighted_normalized_decision_matrix[i][j] = (aij * float(wj_l), bij * float(wj_m), cij * float(wj_u))

        print("After normalization loop")

        # Calculate FPIS and FNIS
        fpis = [(0, 0, 0) for numbers in range(num_criteria)]
        fnis = [(0, 0, 0) for numbers in range(num_criteria)]

        for j, criteria_type in enumerate(criteria_types):
            if criteria_type == "+":
                max_c0 = max(weighted_normalized_decision_matrix[i][j][0] for i in range(num_alternatives))
                max_c1 = max(weighted_normalized_decision_matrix[i][j][1] for i in range(num_alternatives))
                max_c2 = max(weighted_normalized_decision_matrix[i][j][2] for i in range(num_alternatives))

                min_a0 = min(weighted_normalized_decision_matrix[i][j][0] for i in range(num_alternatives))
                min_a1 = min(weighted_normalized_decision_matrix[i][j][1] for i in range(num_alternatives))
                min_a2 = min(weighted_normalized_decision_matrix[i][j][2] for i in range(num_alternatives))
                fpis[j] = (max_c0, max_c1, max_c2)
                fnis[j] = (min_a0, min_a1, min_a2)

            elif criteria_type == "-":
                max_c0 = max(weighted_normalized_decision_matrix[i][j][0] for i in range(num_alternatives))
                max_c1 = max(weighted_normalized_decision_matrix[i][j][1] for i in range(num_alternatives))
                max_c2 = max(weighted_normalized_decision_matrix[i][j][2] for i in range(num_alternatives))

                min_a0 = min(weighted_normalized_decision_matrix[i][j][0] for i in range(num_alternatives))
                min_a1 = min(weighted_normalized_decision_matrix[i][j][1] for i in range(num_alternatives))
                min_a2 = min(weighted_normalized_decision_matrix[i][j][2] for i in range(num_alternatives))
                fpis[j] = (min_a0, min_a1, min_a2)
                fnis[j] = (max_c0, max_c1, max_c2)


        # Calculate L2-distance from the ideal solution
        distance_to_best = [0] * num_alternatives
        distance_to_worst = [0] * num_alternatives

        for i in range(num_alternatives):
            for j in range(num_criteria):
                aij, bij, cij = weighted_normalized_decision_matrix[i][j]
                awj, bwj, cwj = fpis[j]
                abj, bbj, cbj = fnis[j]
                distance_to_best[i] += ((((aij - awj)**2 + (bij - bwj)**2 + (cij - cwj)**2)/3)**0.5)
                distance_to_worst[i] +=((((aij - abj)**2 + (bij - bbj)**2 + (cij - cbj)**2)/3)**0.5)

           # distance_to_best[i] = (1/3*distance_to_best[i])**0.5
            #distance_to_worst[i] = (1/3*distance_to_worst[i])**0.5

        # Calculate the relative closeness
        relative_closeness = [distance_to_worst[i] / (distance_to_worst[i] + distance_to_best[i]) for i in range(num_alternatives)]

        response = {
            'normalized_decision_matrix': normalized_decision_matrix,
            'weighted_normalized_decision_matrix': weighted_normalized_decision_matrix,
            'fpis': fpis,
            'fnis': fnis,
            'distance_to_best': distance_to_best,
            'distance_to_worst': distance_to_worst,
            'relative_closeness': relative_closeness
        }

        
        print("NOrmalised",distance_to_best, distance_to_worst, relative_closeness) #test

        return JsonResponse(response)

    return JsonResponse({'error': 'Invalid request method'})




@api_view(['GET'])
def calculate_topsis(request):
    # Retrieve the data from the database
    expert_decision_matrices = ExpertDecisionMatrix.objects.all()

    # Process the data and prepare the inputs for the TOPSIS function
    decision_matrix = []
    weights = []
    criteria_is_cost = []  # Add the criteria_is_cost values based on your requirements
    for edm in expert_decision_matrices:
        decision_matrix.append(edm.values)
        # Append weights and criteria_is_cost values if applicable

    # Call the TOPSIS function with the prepared inputs
    results = topsis(decision_matrix, weights, criteria_is_cost)

    # Return the results as a JSON response
    response = {
        "status": "success",
        "results": results
    }
    return JsonResponse(response)

def home(request):
    return HttpResponse("Hello, welcome to the home page!")
