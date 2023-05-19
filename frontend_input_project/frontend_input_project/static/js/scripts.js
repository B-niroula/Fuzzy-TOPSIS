document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const nextButton = document.getElementById('next-button');
   
    nextButton.addEventListener('click', function() {
        steps[0].style.display = 'none';
        steps[1].style.display = 'block';
    });


    
}); // Add this closing bracket for the DOMContentLoaded event listener
