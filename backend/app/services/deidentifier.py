import re
from typing import Dict, Tuple, List

class ClinicalDeidentifier:
    """
    Data Governance Compliance Service for Healthcare AI.
    Redacts the 18 HIPAA Protected Health Information (PHI) elements
    before sending text payloads to external LLM APIs (Google AI Studio / Gemini).
    """

    # Regex patterns for HIPAA PHI elements
    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    PHONE_PATTERN = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    SSN_AADHAAR_PATTERN = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b'
    MRN_PATTERN = r'\b(?:MRN|ID|PAT|REF)[-:]?\s*#?\d{4,10}\b'
    DATE_OF_BIRTH_PATTERN = r'\b(?:DOB|Date of Birth|Born)[:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
    EXACT_DATE_PATTERN = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
    ADDRESS_PATTERN = r'\b\d{1,5}\s(?:[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Square|Sq|Plaza|Plz|Parkway|Pkwy|Way))\b'
    # Insurance & Financial identifiers
    INSURANCE_ID_PATTERN = r'\b(?:Insurance|Policy|Member|Ins|UHID)[-:\s]?#?\s*[A-Z0-9]{6,15}\b'
    CREDIT_CARD_PATTERN = r'\b(?:\d{4}[\s-]?){3}\d{4}\b'
    FINANCIAL_ACCOUNT_PATTERN = r'\b(?:Account|Acct|A/C)[-:\s]*#?\s*\d{8,18}\b'
    # Common name titles for name scrubbing fallback
    TITLE_NAME_PATTERN = r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Patient|Master)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b'

    @classmethod
    def sanitize_clinical_text(cls, text: str, explicit_names: List[str] = None) -> Tuple[str, Dict[str, str], List[Dict[str, str]]]:
        """
        Sanitizes raw clinical document text by masking all PHI elements.
        Returns:
            - sanitized_text (str): Safe text ready for Gemini API call
            - token_map (dict): Mapping of tokens -> original values for local re-identification
            - redaction_log (list): Audit trail of what was redacted for compliance reporting
        """
        if not text:
            return "", {}, []

        sanitized_text = text
        token_map = {}
        redaction_log = []
        token_counter = {"NAME": 1, "PHONE": 1, "EMAIL": 1, "ID": 1, "DATE": 1, "ADDRESS": 1}

        # 1. Scrub explicit names if passed (e.g. from patient database record)
        if explicit_names:
            for name in explicit_names:
                if name and len(name.strip()) > 2 and name.lower() in sanitized_text.lower():
                    token = f"[REDACTED_PATIENT_NAME_{token_counter['NAME']}]"
                    pattern = re.compile(re.escape(name), re.IGNORECASE)
                    sanitized_text = pattern.sub(token, sanitized_text)
                    token_map[token] = name
                    redaction_log.append({"category": "Patient Identity", "token": token, "type": "Name"})
                    token_counter["NAME"] += 1

        # 2. Scrub emails
        emails = re.findall(cls.EMAIL_PATTERN, sanitized_text)
        for email in emails:
            token = f"[REDACTED_EMAIL_{token_counter['EMAIL']}]"
            sanitized_text = sanitized_text.replace(email, token)
            token_map[token] = email
            redaction_log.append({"category": "Contact Information", "token": token, "type": "Email"})
            token_counter["EMAIL"] += 1

        # 3. Scrub phone numbers
        phones = re.findall(cls.PHONE_PATTERN, sanitized_text)
        for phone in phones:
            if len(phone.replace("-", "").replace(" ", "").replace("+", "")) >= 7:
                token = f"[REDACTED_PHONE_{token_counter['PHONE']}]"
                sanitized_text = sanitized_text.replace(phone, token)
                token_map[token] = phone
                redaction_log.append({"category": "Contact Information", "token": token, "type": "Phone"})
                token_counter["PHONE"] += 1

        # 4. Scrub SSN / Aadhaar / National IDs
        ids = re.findall(cls.SSN_AADHAAR_PATTERN, sanitized_text)
        for id_val in ids:
            token = f"[REDACTED_NATIONAL_ID_{token_counter['ID']}]"
            sanitized_text = sanitized_text.replace(id_val, token)
            token_map[token] = id_val
            redaction_log.append({"category": "Government ID", "token": token, "type": "National ID"})
            token_counter["ID"] += 1

        # 5. Scrub MRNs / Medical Record Numbers
        mrns = re.findall(cls.MRN_PATTERN, sanitized_text, re.IGNORECASE)
        for mrn in mrns:
            token = f"[REDACTED_MRN_{token_counter['ID']}]"
            sanitized_text = sanitized_text.replace(mrn, token)
            token_map[token] = mrn
            redaction_log.append({"category": "Medical Record Identifier", "token": token, "type": "MRN"})
            token_counter["ID"] += 1

        # 6. Scrub DOBs and exact dates
        dobs = re.findall(cls.DATE_OF_BIRTH_PATTERN, sanitized_text, re.IGNORECASE)
        for dob in dobs:
            token = f"[REDACTED_DOB_{token_counter['DATE']}]"
            sanitized_text = sanitized_text.replace(dob, token)
            token_map[token] = dob
            redaction_log.append({"category": "Timestamp/DOB", "token": token, "type": "Date of Birth"})
            token_counter["DATE"] += 1

        # 7. Scrub Title + Name combinations (e.g., "Patient John Doe", "Mr. Smith")
        title_names = re.findall(cls.TITLE_NAME_PATTERN, sanitized_text)
        for name in title_names:
            if name.lower() not in ["doctor", "physician", "nurse", "clinic"]:
                token = f"[REDACTED_NAME_{token_counter['NAME']}]"
                sanitized_text = re.sub(r'\b' + re.escape(name) + r'\b', token, sanitized_text)
                token_map[token] = name
                redaction_log.append({"category": "Patient Identity", "token": token, "type": "Name"})
                token_counter["NAME"] += 1

        # 8. Scrub Addresses
        addresses = re.findall(cls.ADDRESS_PATTERN, sanitized_text, re.IGNORECASE)
        for addr in addresses:
            token = f"[REDACTED_ADDRESS_{token_counter['ADDRESS']}]"
            sanitized_text = sanitized_text.replace(addr, token)
            token_map[token] = addr
            redaction_log.append({"category": "Geographic Location", "token": token, "type": "Address"})
            token_counter["ADDRESS"] += 1

        # 9. Scrub Insurance IDs
        ins_ids = re.findall(cls.INSURANCE_ID_PATTERN, sanitized_text, re.IGNORECASE)
        for ins in ins_ids:
            token = f"[REDACTED_INSURANCE_ID_{token_counter['ID']}]"
            sanitized_text = sanitized_text.replace(ins, token)
            token_map[token] = ins
            redaction_log.append({"category": "Insurance Identifier", "token": token, "type": "Insurance ID"})
            token_counter["ID"] += 1

        # 10. Scrub Credit Card / Financial account numbers
        cards = re.findall(cls.CREDIT_CARD_PATTERN, sanitized_text)
        for card in cards:
            token = f"[REDACTED_FINANCIAL_{token_counter['ID']}]"
            sanitized_text = sanitized_text.replace(card, token)
            token_map[token] = card
            redaction_log.append({"category": "Financial Information", "token": token, "type": "Credit Card / Account"})
            token_counter["ID"] += 1

        return sanitized_text, token_map, redaction_log

    @staticmethod
    def assess_combination_risk(fields: Dict[str, str]) -> Dict[str, object]:
        """
        Assesses re-identification risk when multiple quasi-identifiers are combined.
        Even individually safe fields can identify a patient when combined.
        Returns a risk assessment dict.
        """
        quasi_identifiers = []
        risk_score = 0

        if fields.get("age"):
            quasi_identifiers.append("age")
            risk_score += 10
        if fields.get("gender"):
            quasi_identifiers.append("gender")
            risk_score += 5
        if fields.get("zip_code") or fields.get("location"):
            quasi_identifiers.append("geographic location")
            risk_score += 20
        if fields.get("diagnosis"):
            quasi_identifiers.append("diagnosis")
            risk_score += 15
        if fields.get("rare_condition"):
            quasi_identifiers.append("rare condition")
            risk_score += 40
        if fields.get("occupation"):
            quasi_identifiers.append("occupation")
            risk_score += 15
        if fields.get("ethnicity"):
            quasi_identifiers.append("ethnicity")
            risk_score += 10

        if risk_score >= 50:
            level = "HIGH"
            warning = "Combination of fields creates HIGH re-identification risk. Consider generalizing age to range and removing geographic/occupation data."
        elif risk_score >= 25:
            level = "MODERATE"
            warning = "Moderate re-identification risk from field combination. Review before sending."
        else:
            level = "LOW"
            warning = None

        return {
            "risk_level": level,
            "risk_score": risk_score,
            "quasi_identifiers_present": quasi_identifiers,
            "warning": warning
        }
