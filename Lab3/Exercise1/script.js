document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("registration-form");
    const inputs = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        confirm: document.getElementById("confirm"),
        age: document.getElementById("age"),
        role: document.getElementById("role"),
        skills: Array.from(document.querySelectorAll('input[name="skills"]')),
    };

    // Role-driven validation rules
    const roleRules = {
        student: {
            minAge: 13,
            allowedDomains: ["edu", "university.com"],
            minSkills: 1,
            password: {
                minLength: 8,
                upper: false,
                lower: true,
                number: true,
                special: false,
            },
        },
        teacher: {
            minAge: 21,
            allowedDomains: ["edu", "school.edu", "k12.edu"],
            minSkills: 2,
            password: {
                minLength: 10,
                upper: true,
                lower: true,
                number: true,
                special: false,
            },
        },
        admin: {
            minAge: 25,
            allowedDomains: ["company.com", "admin.org"],
            minSkills: 3,
            password: {
                minLength: 12,
                upper: true,
                lower: true,
                number: true,
                special: true,
            },
        },
    };

    const statusEl = document.getElementById("form-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const skillsRequirement = document.getElementById("skills-requirement");
    const roleHelper = document.getElementById("role-helper");

    function setFeedback(name, valid, message) {
        const field = name === "skills"
            ? document.getElementById("skills-wrapper")
            : inputs[name].closest(".field");
        
        const feedback = document.querySelector(`[data-feedback="${name}"]`);
        
        field.classList.remove("valid", "invalid");
        if (inputs[name].value || name === "skills") { // Only show green/red if user has interacted (or for skills)
             field.classList.add(valid ? "valid" : "invalid");
        }
       
        feedback.textContent = message || (valid ? "Looks good." : "");
    }

    function getRule() {
        return roleRules[inputs.role.value] || null;
    }

    function validateName() {
        const value = inputs.name.value.trim();
        const ok = value.length >= 2;
        if (value.length > 0) {
            setFeedback(
                "name",
                ok,
                ok ? "" : "Name must be at least 2 characters.",
            );
        }
        return ok;
    }

    function validateEmail() {
        const value = inputs.email.value.trim();
        if (value.length === 0) return false;

        const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const rule = getRule();
        
        if (!basic) {
            setFeedback("email", false, "Enter a valid email address.");
            return false;
        }
        
        if (!rule) {
            setFeedback("email", true, "");
            return true;
        }
        
        const domain = value.split("@")[1].toLowerCase();
        const matches = rule.allowedDomains.some((d) => domain.endsWith(d));
        setFeedback(
            "email",
            matches,
            matches
                ? "Domain accepted for this role."
                : `Email must end with: ${rule.allowedDomains.join(", ")}`,
        );
        return matches;
    }

    function validatePassword() {
        const value = inputs.password.value;
        if (value.length === 0) return false;

        const rule = getRule();
        if (!rule) {
            setFeedback("password", false, "Choose a role to see requirements.");
            return false;
        }
        
        const checks = {
            length: value.length >= rule.password.minLength,
            upper: !rule.password.upper || /[A-Z]/.test(value),
            lower: !rule.password.lower || /[a-z]/.test(value),
            number: !rule.password.number || /\d/.test(value),
            special: !rule.password.special || /[^A-Za-z0-9]/.test(value),
        };
        
        const allGood = Object.values(checks).every(Boolean);
        const unmet = [];
        if (!checks.length) unmet.push(`≥ ${rule.password.minLength} chars`);
        if (!checks.upper && rule.password.upper) unmet.push("an uppercase letter");
        if (!checks.lower && rule.password.lower) unmet.push("a lowercase letter");
        if (!checks.number && rule.password.number) unmet.push("a number");
        if (!checks.special && rule.password.special) unmet.push("a special character");
        
        setFeedback(
            "password",
            allGood,
            allGood ? "Strong enough for this role." : `Add ${unmet.join(", ")}.`,
        );
        return allGood;
    }

    function validateConfirm() {
        if (inputs.confirm.value.length === 0) return false;
        
        const match = inputs.password.value === inputs.confirm.value;
        setFeedback(
            "confirm",
            match,
            match ? "Passwords match." : "Passwords do not match.",
        );
        return match;
    }

    function validateAge() {
        const rule = getRule();
        const ageVal = Number(inputs.age.value);
        
        if (inputs.age.value === "") return false;

        if (!Number.isFinite(ageVal)) {
            setFeedback("age", false, "Enter your age.");
            return false;
        }
        if (!rule) {
            setFeedback("age", false, "Choose a role to validate age.");
            return false;
        }
        const ok = ageVal >= rule.minAge && ageVal <= 120;
        setFeedback(
            "age",
            ok,
            ok ? "Age accepted." : `Minimum age for this role is ${rule.minAge}.`,
        );
        return ok;
    }

    function validateRole() {
        const ok = Boolean(inputs.role.value);
        setFeedback("role", ok, ok ? "" : "Select a role.");
        return ok;
    }

    function validateSkills() {
        const rule = getRule();
        const checked = inputs.skills.filter((box) => box.checked).length;
        if (!rule) {
            setFeedback("skills", false, "Choose a role to see required skills.");
            return false;
        }
        const ok = checked >= rule.minSkills;
        setFeedback(
            "skills",
            ok,
            ok
                ? "Skills requirement met."
                : `Pick at least ${rule.minSkills} skill${rule.minSkills > 1 ? "s" : ""}.`,
        );
        return ok;
    }

    function updateRoleHints() {
        const rule = getRule();
        if (!rule) {
            skillsRequirement.textContent = "(choose a role to see how many skills are required)";
            roleHelper.textContent = "Pick a role to see tailored rules.";
            // Reset fields if role is cleared
            return;
        }
        skillsRequirement.textContent = `(at least ${rule.minSkills} for ${inputs.role.value})`;
        roleHelper.textContent = `Requirements: Age ≥ ${rule.minAge}, Email Domain: ${rule.allowedDomains.join(", ")}, Pass Length ≥ ${rule.password.minLength}.`;
        
        // Re-validate fields that depend on role
        if(inputs.email.value) validateEmail();
        if(inputs.password.value) validatePassword();
        if(inputs.age.value) validateAge();
        validateSkills();
    }

    function validateAll() {
        // We run all validators to update UI, but carefully
        const results = [
            validateRole(),
            validateName(),
            validateEmail(),
            validatePassword(),
            validateConfirm(),
            validateAge(),
            validateSkills(),
        ];
        const allValid = results.every(Boolean);
        submitBtn.disabled = !allValid;
        statusEl.textContent = allValid
            ? "All checks passed. You can submit."
            : "Resolve highlighted fields to enable submission.";
        
        if (allValid) {
            statusEl.style.color = "var(--success)";
            statusEl.style.borderColor = "var(--success)";
            statusEl.style.background = "#f0fff4";
        } else {
            statusEl.style.color = "var(--muted)";
            statusEl.style.borderColor = "var(--border)";
            statusEl.style.background = "#eef2ff";
        }

        return allValid;
    }

    // Event Listeners
    [inputs.name, inputs.email, inputs.password, inputs.confirm, inputs.age].forEach((el) => {
        el.addEventListener("input", validateAll);
    });

    inputs.role.addEventListener("change", () => {
        updateRoleHints();
        validateAll();
    });

    inputs.skills.forEach((box) =>
        box.addEventListener("change", validateAll),
    );

    form.addEventListener("submit", (evt) => {
        evt.preventDefault();
        if (validateAll()) {
            alert("Registration Successful! (Simulation)");
            form.reset();
            updateRoleHints();
            document.querySelectorAll('.valid').forEach(el => el.classList.remove('valid'));
            submitBtn.disabled = true;
            statusEl.textContent = "Complete the fields to enable submission.";
        }
    });

    // Initial State
    updateRoleHints();
});