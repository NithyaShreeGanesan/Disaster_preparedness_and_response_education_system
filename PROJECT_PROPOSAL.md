> **Note:** This document is the original project proposal — problem statement, objectives, and planned database design submitted for approval.
> The final implemented system (see [README.md](./README.md)) uses a simplified schema focused on disaster info and quizzes, rather than the full Training/Alert/Incident-Report/Evacuation modules originally proposed here.

---
# Disaster Preparedness and Response Education System for Schools and Colleges

---

## Project Title

**Disaster Preparedness and Response Education System for Schools and Colleges**

---

## Project Statement (Problem Statement)

Schools and colleges often lack proper disaster preparedness training and organized emergency response systems.  
During disasters such as fires, earthquakes, floods, or pandemics, students and staff may panic due to lack of awareness, communication, and clear evacuation procedures.  
This can result in injuries, loss of life, and property damage.  
Therefore, there is a need for a digital system that educates students and staff and helps institutions respond effectively during emergencies.

---

## Project Objectives

- To educate students and staff about different types of disasters  
- To provide awareness on safety measures and emergency procedures  
- To manage disaster-related training and preparedness programs  
- To enable quick communication and alerts during emergencies  
- To support safe evacuation and first-aid response  
- To reduce panic, risks, and losses during disasters  

---

## Model List (System Modules / Models)

- **User Model** – Manages students, teachers, and administrators  
- **Disaster Model** – Stores information about different disaster types  
- **Training Model** – Manages disaster awareness programs and drills  
- **Alert Model** – Handles emergency notifications and alerts  
- **Incident Report Model** – Records disaster incidents and user reports  
- **Evacuation Plan Model** – Stores evacuation routes and safety instructions  

---
## Table List (Database Tables)

### User Table

| Field Name | Description |
|-----------|------------|
| user_id | Primary Key |
| name | User full name |
| role | Admin / Teacher / Student |
| email | User email address |
| phone | Contact number |

---

### Disaster Table

| Field Name | Description |
|-----------|------------|
| disaster_id | Primary Key |
| disaster_type | Type of disaster |
| description | Disaster details |
| severity_level | Low / Medium / High |

---

### Training Table

| Field Name | Description |
|-----------|------------|
| training_id | Primary Key |
| topic | Training topic |
| date | Training date |
| duration | Duration of training |

---

### Alert Table

| Field Name | Description |
|-----------|------------|
| alert_id | Primary Key |
| message | Alert message |
| date_time | Date and time of alert |
| disaster_id | Foreign Key (Disaster) |

---

### Incident_Report Table

| Field Name | Description |
|-----------|------------|
| report_id | Primary Key |
| description | Incident description |
| location | Incident location |
| status | Report status |
| user_id | Foreign Key (User) |

---

### Evacuation_Plan Table

| Field Name | Description |
|-----------|------------|
| plan_id | Primary Key |
| location | Evacuation location |
| route_details | Evacuation route |
| safety_instructions | Safety guidelines |

---

## Expected Outcome

- Improved awareness and understanding of disaster preparedness among students and staff  
- Availability of a centralized digital system for disaster education and emergency management  
- Faster and more effective communication during emergency situations  
- Proper guidance for safe evacuation and first-aid response  
- Reduced panic, injuries, and loss of life during disasters  
- Enhanced safety culture in schools and colleges

---
