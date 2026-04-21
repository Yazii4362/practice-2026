$(document).ready(function() {
    // --- Common UI Interactions ---

    // Mobile Menu Toggle
    $('.hamburger-btn').click(function() {
        $(this).toggleClass('open');
        $('.nav-menu').toggleClass('active');
    });

    // --- Calculator Specific Logic ---
    // Only run if we are on a page that has the calculator form
    if ($('#monthly-amount-input').length > 0) {
        
        // Formatting utility for numbers with commas
        const formatNumber = (num) => {
            return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // Remove commas parser
        const parseNumber = (str) => {
            return parseInt(str.toString().replace(/,/g, ''), 10) || 0;
        };

        // Auto-formatting the input field as user types
        $('#monthly-amount-input').on('keyup', function(e) {
            let val = parseNumber($(this).val());
            if (val > 500000) val = 500000;
            if (val < 0) val = 0;
            
            $(this).val(formatNumber(val));
            $('#monthly-amount').val(val).trigger('input'); // sync slider
        });

        // Sync slider with input field
        $('#monthly-amount').on('input', function() {
            let val = $(this).val();
            $('#monthly-amount-input').val(formatNumber(val));
            
            // Update slider fill background
            updateSliderFill(this);
            calculate();
        });

        function updateSliderFill(element) {
            const value = (element.value - element.min) / (element.max - element.min) * 100;
            element.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${value}%, var(--primary-light) ${value}%, var(--primary-light) 100%)`;
        }

        // Trigger calculation when other inputs change
        $('select, #basic-rate, #prime-rate').on('change input', function() {
            calculate();
        });

        // Count-up animation for numbers
        function animateValue(id, start, end, duration) {
            if (start === end) return;
            const obj = document.getElementById(id);
            if(!obj) return;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                obj.innerHTML = formatNumber(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        // Stores previous values to start animation from
        let prevTotal = 0;
        let prevPrincipal = 0;
        let prevInterest = 0;
        let prevGov = 0;

        // --- Core Calculation Logic (청년미래적금 3년 만기) ---
        function calculate() {
            const monthlyAmount = parseNumber($('#monthly-amount-input').val()) || 0;
            const incomeTier = $('#income-tier').val();
            const basicRate = parseFloat($('#basic-rate').val()) || 0;
            const primeRate = parseFloat($('#prime-rate').val()) || 0;
            const totalRate = (basicRate + primeRate) / 100;

            // Determine Government Match Rate based on Tier
            let matchRate = 0;
            if (incomeTier === 'general') {
                matchRate = 0.06;
            } else if (incomeTier === 'preferential') {
                matchRate = 0.12;
            }

            const months = 36; // 3 years fixed

            // 1. Principal (원금)
            const principal = monthlyAmount * months;

            // 2. Interest (이자 - 단리 계산)
            const interest = monthlyAmount * (months * (months + 1) / 2) * (totalRate / 12);

            // 3. Government Contribution (정부 기여금)
            const govContribution = monthlyAmount * matchRate * months;

            // 4. Total Expected Maturity Amount
            const totalAmount = principal + interest + govContribution;

            // --- Update UI ---
            animateValue("total-result", prevTotal, totalAmount, 600);
            animateValue("val-principal", prevPrincipal, principal, 600);
            animateValue("val-interest", prevInterest, interest, 600);
            animateValue("val-gov", prevGov, govContribution, 600);

            // Update Progress Bar Segments
            if (totalAmount > 0) {
                const widthPrincipal = (principal / totalAmount) * 100;
                const widthInterest = (interest / totalAmount) * 100;
                const widthGov = (govContribution / totalAmount) * 100;

                $('#bar-principal').css('width', `${widthPrincipal}%`);
                $('#bar-interest').css('width', `${widthInterest}%`);
                $('#bar-gov').css('width', `${widthGov}%`);
            } else {
                $('.progress-segment').css('width', '0%');
            }

            // Save prev values
            prevTotal = totalAmount;
            prevPrincipal = principal;
            prevInterest = interest;
            prevGov = govContribution;
        }

        // Initialize state on load
        updateSliderFill(document.getElementById('monthly-amount'));
        calculate();
    }
});
