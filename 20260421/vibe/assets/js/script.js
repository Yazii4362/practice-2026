$(document).ready(function () {

    // =========================================================
    // Common Utilities
    // =========================================================
    const formatNumber = (num) =>
        Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const parseNumber = (str) =>
        parseInt(str.toString().replace(/,/g, ''), 10) || 0;

    function animateValue(id, start, end, duration) {
        if (start === end) return;
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = formatNumber(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    function updateSliderFill(element) {
        const value = (element.value - element.min) / (element.max - element.min) * 100;
        element.style.background = `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${value}%, rgba(0, 0, 0, 0.06) ${value}%, rgba(0, 0, 0, 0.06) 100%)`;
    }

    // Mobile Menu Toggle
    $('.hamburger-btn').click(function () {
        $(this).toggleClass('open');
        $('.nav-menu').toggleClass('active');
    });


    // =========================================================
    // [1] 청년미래적금 Calculator (future_savings.html)
    // =========================================================
    if ($('#monthly-amount-input').length > 0) {
        let prevTotal = 0, prevPrincipal = 0, prevInterest = 0, prevGov = 0;

        $('#monthly-amount-input').on('keyup', function () {
            let val = parseNumber($(this).val());
            if (val > 500000) val = 500000;
            if (val < 0) val = 0;
            $(this).val(formatNumber(val));
            $('#monthly-amount').val(val).trigger('input');
        });

        $('#monthly-amount').on('input', function () {
            $('#monthly-amount-input').val(formatNumber($(this).val()));
            updateSliderFill(this);
            calcFutureSavings();
        });

        $('select, #basic-rate, #prime-rate').on('change input', calcFutureSavings);

        function calcFutureSavings() {
            const monthlyAmount = parseNumber($('#monthly-amount-input').val());
            const incomeTier = $('#income-tier').val();
            const totalRate = (parseFloat($('#basic-rate').val()) + parseFloat($('#prime-rate').val())) / 100;
            const matchRate = incomeTier === 'preferential' ? 0.12 : 0.06;
            const months = 36;

            const principal = monthlyAmount * months;
            const interest = monthlyAmount * (months * (months + 1) / 2) * (totalRate / 12);
            const govContribution = monthlyAmount * matchRate * months;
            const totalAmount = principal + interest + govContribution;

            animateValue("total-result", prevTotal, totalAmount, 600);
            animateValue("val-principal", prevPrincipal, principal, 600);
            animateValue("val-interest", prevInterest, interest, 600);
            animateValue("val-gov", prevGov, govContribution, 600);

            if (totalAmount > 0) {
                $('#bar-principal').css('width', `${(principal / totalAmount) * 100}%`);
                $('#bar-interest').css('width', `${(interest / totalAmount) * 100}%`);
                $('#bar-gov').css('width', `${(govContribution / totalAmount) * 100}%`);
            }

            prevTotal = totalAmount; prevPrincipal = principal;
            prevInterest = interest; prevGov = govContribution;
        }

        updateSliderFill(document.getElementById('monthly-amount'));
        calcFutureSavings();
    }


    // =========================================================
    // [2] 청년도약계좌 Calculator (leap_account.html)
    // =========================================================
    if ($('#leap-monthly-input').length > 0) {
        let prevTotal = 0, prevPrincipal = 0, prevInterest = 0, prevGov = 0;

        $('#leap-monthly-input').on('keyup', function () {
            let val = parseNumber($(this).val());
            if (val > 700000) val = 700000;
            if (val < 0) val = 0;
            $(this).val(formatNumber(val));
            $('#leap-monthly-slider').val(val).trigger('input');
        });

        $('#leap-monthly-slider').on('input', function () {
            $('#leap-monthly-input').val(formatNumber($(this).val()));
            updateSliderFill(this);
            calcLeapAccount();
        });

        $('#leap-income-tier, #leap-basic-rate, #leap-prime-rate').on('change input', calcLeapAccount);

        function calcLeapAccount() {
            const monthlyAmount = parseNumber($('#leap-monthly-input').val());
            const matchRate = parseFloat($('#leap-income-tier').val());
            const totalRate = (parseFloat($('#leap-basic-rate').val()) + parseFloat($('#leap-prime-rate').val())) / 100;
            const months = 60; // 5 years

            const principal = monthlyAmount * months;
            // 단리 이자 (적금 공식: 매월 납입식)
            const interest = monthlyAmount * (months * (months + 1) / 2) * (totalRate / 12);
            // 정부기여금: 월 납입액 × 매칭률 (월 한도 최대 2.4만원/월 ~ 적용)
            const maxGovMonthly = 24000; // 최대 월 2.4만원 기여금
            const monthlyGov = Math.min(monthlyAmount * matchRate, maxGovMonthly);
            const govContribution = monthlyGov * months;
            const totalAmount = principal + interest + govContribution;

            // 비과세 절세 효과 (이자에 15.4% 세금 면제)
            const taxSave = (interest + govContribution) * 0.154;
            // 실질 수익률 (수익/원금 × 100)
            const yieldRate = principal > 0 ? ((interest + govContribution) / principal * 100).toFixed(2) : 0;

            animateValue("leap-total-result", prevTotal, totalAmount, 600);
            animateValue("leap-val-principal", prevPrincipal, principal, 600);
            animateValue("leap-val-interest", prevInterest, interest, 600);
            animateValue("leap-val-gov", prevGov, govContribution, 600);

            document.getElementById('leap-val-taxsave').textContent = formatNumber(taxSave) + '원';
            document.getElementById('leap-val-yield').textContent = yieldRate + '%';

            if (totalAmount > 0) {
                $('#leap-bar-principal').css('width', `${(principal / totalAmount) * 100}%`);
                $('#leap-bar-interest').css('width', `${(interest / totalAmount) * 100}%`);
                $('#leap-bar-gov').css('width', `${(govContribution / totalAmount) * 100}%`);
            }

            prevTotal = totalAmount; prevPrincipal = principal;
            prevInterest = interest; prevGov = govContribution;
        }

        updateSliderFill(document.getElementById('leap-monthly-slider'));
        calcLeapAccount();
    }


    // =========================================================
    // [3] 청년 버팀목 전세대출 Calculator (housing_loan.html)
    // =========================================================
    if ($('#deposit-input').length > 0) {
        let prevLoan = 0, prevInterest = 0;

        $('#deposit-input').on('keyup', function () {
            let val = parseNumber($(this).val());
            if (val > 300000000) val = 300000000;
            if (val < 0) val = 0;
            $(this).val(formatNumber(val));
            $('#deposit-slider').val(val).trigger('input');
        });

        $('#deposit-slider').on('input', function () {
            $('#deposit-input').val(formatNumber($(this).val()));
            updateSliderFill(this);
            calcHousingLoan();
        });

        $('#loan-income-tier, #loan-ratio, #loan-term').on('change input', calcHousingLoan);

        function calcHousingLoan() {
            const deposit = parseNumber($('#deposit-input').val());
            const annualRate = parseFloat($('#loan-income-tier').val()) / 100;
            const loanRatio = parseFloat($('#loan-ratio').val()) / 100;
            const termYears = parseInt($('#loan-term').val());
            const months = termYears * 12;

            // 청년 버팀목: 보증금 80% 이내, 최대 2.2억
            const maxLoan = 220000000;
            const loanAmount = Math.min(deposit * loanRatio, maxLoan);
            const monthlyRate = annualRate / 12;

            // 이자 전용 납부 (전세대출은 만기일시상환 방식)
            const monthlyInterest = loanAmount * monthlyRate;
            const totalInterest = monthlyInterest * months;
            const refundAmount = deposit; // 만기 시 전액 반환

            const ltv = deposit > 0 ? ((loanAmount / deposit) * 100).toFixed(1) : 0;

            animateValue("loan-amount-result", prevLoan, loanAmount, 600);
            animateValue("loan-val-principal", 0, loanAmount, 600);
            animateValue("loan-val-total-interest", prevInterest, totalInterest, 600);

            document.getElementById('loan-val-monthly-interest').textContent = formatNumber(monthlyInterest) + '원';
            document.getElementById('loan-val-refund').textContent = formatNumber(refundAmount) + '원';
            document.getElementById('loan-val-rate').textContent = (annualRate * 100).toFixed(1) + '%';
            document.getElementById('loan-val-ltv').textContent = ltv + '%';

            const total = loanAmount + totalInterest;
            if (total > 0) {
                $('#loan-bar-principal').css('width', `${(loanAmount / total) * 100}%`);
                $('#loan-bar-interest').css('width', `${(totalInterest / total) * 100}%`);
            }

            prevLoan = loanAmount;
            prevInterest = totalInterest;
        }

        updateSliderFill(document.getElementById('deposit-slider'));
        calcHousingLoan();
    }


    // =========================================================
    // [4] 연말정산 Calculator (year_end_tax.html)
    // =========================================================
    if ($('#tax-salary-input').length > 0) {
        let prevRefund = 0;

        // 숫자 포맷팅 공통 적용
        const taxMoneyInputs = ['#tax-salary-input', '#tax-card-input', '#tax-insurance-input',
            '#tax-medical-input', '#tax-edu-input', '#tax-donate-input', '#tax-pension-input'];

        taxMoneyInputs.forEach(sel => {
            $(sel).on('keyup', function () {
                let val = parseNumber($(this).val());
                $(this).val(formatNumber(val));
                calcYearEndTax();
            });
        });

        $('#tax-salary-slider').on('input', function () {
            $('#tax-salary-input').val(formatNumber($(this).val()));
            updateSliderFill(this);
            calcYearEndTax();
        });

        $('#tax-family').on('change', calcYearEndTax);

        function calcYearEndTax() {
            const salary = parseNumber($('#tax-salary-input').val());
            const cardSpend = parseNumber($('#tax-card-input').val());
            const insurance = parseNumber($('#tax-insurance-input').val());
            const medical = parseNumber($('#tax-medical-input').val());
            const education = parseNumber($('#tax-edu-input').val());
            const donate = parseNumber($('#tax-donate-input').val());
            const pension = parseNumber($('#tax-pension-input').val());
            const familyCount = parseInt($('#tax-family').val());

            // 1. 근로소득공제 (2024년 기준)
            let incomeDeduction = 0;
            if (salary <= 5000000) incomeDeduction = salary * 0.7;
            else if (salary <= 15000000) incomeDeduction = 3500000 + (salary - 5000000) * 0.4;
            else if (salary <= 45000000) incomeDeduction = 7500000 + (salary - 15000000) * 0.15;
            else if (salary <= 100000000) incomeDeduction = 12000000 + (salary - 45000000) * 0.05;
            else incomeDeduction = 14750000 + (salary - 100000000) * 0.02;
            incomeDeduction = Math.min(incomeDeduction, 20000000); // 한도 2000만원

            const earnedIncome = salary - incomeDeduction;

            // 2. 인적공제 (본인 150만원 + 부양가족1인당 150만원)
            const personalDeduction = 1500000 * (1 + familyCount);

            // 3. 카드 소득공제
            const cardThreshold = salary * 0.25;
            const cardExcess = Math.max(0, cardSpend - cardThreshold);
            const cardDeduction = Math.min(cardExcess * 0.15, 3000000);

            // 4. 보험료 세액공제 (12%)
            const insuranceCredit = Math.min(insurance, 1000000) * 0.12;

            // 5. 의료비 세액공제 (15%, 총급여 3% 초과분)
            const medicalThreshold = salary * 0.03;
            const medicalExcess = Math.max(0, medical - medicalThreshold);
            const medicalCredit = Math.min(medicalExcess, 7000000) * 0.15;

            // 6. 교육비 세액공제 (15%)
            const eduCredit = Math.min(education, 9000000) * 0.15;

            // 7. 기부금 세액공제 (15%, 1천만 초과분 30%)
            const donateCredit = donate <= 10000000 ? donate * 0.15 : 1500000 + (donate - 10000000) * 0.3;

            // 8. 연금저축/IRP 세액공제 (16.5% ~ 13.2%)
            const pensionLimit = salary <= 55000000 ? 6000000 : 4000000;
            const pensionRate = salary <= 55000000 ? 0.165 : 0.132;
            const pensionCredit = Math.min(pension, pensionLimit) * pensionRate;

            // 과세표준
            const taxBase = Math.max(0, earnedIncome - personalDeduction - cardDeduction);

            // 산출세액 (2024년 세율)
            let grossTax = 0;
            if (taxBase <= 14000000) grossTax = taxBase * 0.06;
            else if (taxBase <= 50000000) grossTax = 840000 + (taxBase - 14000000) * 0.15;
            else if (taxBase <= 88000000) grossTax = 6240000 + (taxBase - 50000000) * 0.24;
            else if (taxBase <= 150000000) grossTax = 15360000 + (taxBase - 88000000) * 0.35;
            else if (taxBase <= 300000000) grossTax = 37060000 + (taxBase - 150000000) * 0.38;
            else if (taxBase <= 500000000) grossTax = 94060000 + (taxBase - 300000000) * 0.40;
            else grossTax = 174060000 + (taxBase - 500000000) * 0.42;

            // 근로소득세액공제
            let earnedTaxCredit = 0;
            if (grossTax <= 1300000) earnedTaxCredit = grossTax * 0.55;
            else earnedTaxCredit = 715000 + (grossTax - 1300000) * 0.30;
            earnedTaxCredit = Math.min(earnedTaxCredit, 740000);

            // 총 세액공제
            const totalCredit = earnedTaxCredit + insuranceCredit + medicalCredit + eduCredit + donateCredit + pensionCredit;

            // 결정세액 (지방소득세 10% 포함)
            const finalTax = Math.max(0, grossTax - totalCredit) * 1.1;

            // 기납부세액 (간이세액 추정 - 산출세액 기준 근사치)
            const withholding = grossTax * 1.1;

            // 환급/추납
            const refundOrPay = withholding - finalTax;

            // UI 업데이트
            const label = refundOrPay >= 0 ? '예상 환급액 💸' : '예상 추가납부액 😰';
            $('#tax-result-label').text(label);
            $('#tax-total-result').css('color', refundOrPay >= 0 ? 'var(--accent-primary)' : '#EF4444');

            animateValue("tax-total-result", prevRefund, Math.abs(refundOrPay), 600);
            animateValue("tax-val-taxbase", 0, taxBase, 400);
            animateValue("tax-val-gross-tax", 0, grossTax, 400);
            animateValue("tax-val-credit", 0, totalCredit, 400);
            animateValue("tax-val-final", 0, finalTax, 400);
            animateValue("tax-val-paid", 0, withholding, 400);

            if (withholding + finalTax > 0) {
                const paidWidth = (withholding / (withholding + finalTax)) * 100;
                const refundWidth = (Math.abs(refundOrPay) / (withholding + finalTax)) * 100;
                $('#tax-bar-paid').css('width', `${paidWidth}%`);
                $('#tax-bar-refund').css('width', `${refundWidth}%`);
            }

            prevRefund = Math.abs(refundOrPay);
        }

        updateSliderFill(document.getElementById('tax-salary-slider'));
        calcYearEndTax();
    }

});
