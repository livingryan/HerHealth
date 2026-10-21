"""Education library endpoints.

Articles are original, general health education. They never constitute
individualized medical advice, and references point to reputable public
health organizations without inventing statistics.
"""

from fastapi import APIRouter, HTTPException

from app.schemas import EducationArticle, EducationArticleDetail

router = APIRouter(tags=["education"])

_ARTICLES: dict[str, EducationArticle] = {
    "anemia-iron-deficiency": EducationArticle(
        id="anemia-iron-deficiency",
        title="Understanding anemia and iron deficiency",
        category="Anemia",
        excerpt=(
            "Anemia means your blood has fewer healthy red blood cells than usual, "
            "often because of low iron. Learn the signs and when iron matters."
        ),
        read_time_minutes=5,
    ),
    "iron-rich-foods": EducationArticle(
        id="iron-rich-foods",
        title="Iron-rich foods and nutrition",
        category="Nutrition",
        excerpt=(
            "Which foods contain iron, how to pair them for better absorption, and "
            "simple ways to build iron-supportive meals."
        ),
        read_time_minutes=6,
    ),
    "menstrual-health": EducationArticle(
        id="menstrual-health",
        title="Menstrual health: what is typical and what is not",
        category="Menstrual health",
        excerpt=(
            "Cycle length, bleeding patterns, and symptoms worth tracking -- and when "
            "a pattern is a reason to talk with a clinician."
        ),
        read_time_minutes=5,
    ),
    "pcos-hormonal-health": EducationArticle(
        id="pcos-hormonal-health",
        title="PCOS and hormonal health",
        category="PCOS",
        excerpt=(
            "An overview of polycystic ovary syndrome symptoms, how it is assessed, "
            "and why only a clinician can diagnose it."
        ),
        read_time_minutes=6,
    ),
    "preventive-care": EducationArticle(
        id="preventive-care",
        title="Preventive care: screenings and checkups",
        category="Preventive care",
        excerpt=(
            "Routine blood pressure, blood sugar, and reproductive-health checks that "
            "help you notice patterns early."
        ),
        read_time_minutes=4,
    ),
    "when-to-seek-care": EducationArticle(
        id="when-to-seek-care",
        title="When to seek medical attention",
        category="Care guidance",
        excerpt=(
            "Clear signs that it is time to contact a clinician or seek urgent care, "
            "written without replacing professional judgment."
        ),
        read_time_minutes=4,
    ),
}


_CONTENT: dict[str, str] = {
    "anemia-iron-deficiency": """# Understanding anemia and iron deficiency

Anemia happens when your blood does not carry enough oxygen to your tissues, most
often because there is not enough hemoglobin -- the iron-rich protein in red blood
cells. Iron-deficiency anemia is one form of anemia; others have different causes,
so low iron is not automatically the explanation for every case.

Common signs can include unusual tiredness, pale skin, shortness of breath during
everyday activity, feeling cold, brittle nails, or headaches. Many people have mild
symptoms for a long time before noticing them.

A blood test (typically a complete blood count, and sometimes iron studies) is the
only way to confirm anemia and identify its cause. Images of the eyelid or nails
can raise awareness but cannot measure hemoglobin.

## Who may be more likely to need attention

People with heavy menstrual bleeding, people who are pregnant, people with diets low
in iron-rich foods, and people with conditions that affect iron absorption or cause
slow blood loss should be especially attentive. This is general information -- your
personal risk depends on your health history.

## When to contact a clinician

Contact a clinician if fatigue is persistent and unexplained, if periods are
unusually heavy, or if you notice pale skin, shortness of breath, or chest pain with
activity. Seek urgent care for fainting, severe weakness, or chest pain.

## References

* Centers for Disease Control and Prevention (CDC) -- Iron and Iron Deficiency
  https://www.cdc.gov/nutrition/iron-deficiency/index.html
* National Heart, Lung, and Blood Institute (NHLBI) -- Anemia
  https://www.nhlbi.nih.gov/health/anemia
* Mayo Clinic -- Anemia
  https://www.mayoclinic.org/diseases-conditions/anemia/symptoms-causes/syc-20353268
""",
    "iron-rich-foods": """# Iron-rich foods and nutrition

Iron comes in two forms in food: heme iron (from animal sources, generally absorbed
more readily) and non-heme iron (from plant sources and fortified foods).

## Iron-containing foods

* Animal sources: beef, lamb, poultry, fish (especially sardines and tuna), eggs.
* Plant sources: lentils, chickpeas, beans, tofu, tempeh, spinach, kale, pumpkin
  seeds, sesame seeds, fortified breakfast cereals, oats.
* Dried fruits: raisins, apricots, prunes.

## Helping your body absorb iron

Vitamin C helps the body absorb non-heme (plant) iron. Try pairing lentils with
tomatoes, spinach with orange segments, or fortified cereal with strawberries.

Tea and coffee consumed with meals can reduce non-heme iron absorption; having them
between meals instead is a simple adjustment.

## A gentle note

Needs vary widely by age, pregnancy status, menstruation patterns, and health
history. Self-treating with iron supplements is not recommended without a clinician,
because too much iron can be harmful. If you suspect low iron, ask for a blood test
first.

## References

* Office of Dietary Supplements, National Institutes of Health -- Iron
  https://ods.od.nih.gov/factsheets/Iron-Consumer/
* CDC -- Iron Deficiency
  https://www.cdc.gov/nutrition/iron-deficiency/index.html
* Mayo Clinic -- Iron-deficiency anemia
  https://www.mayoclinic.org/diseases-conditions/anemia/symptoms-causes/syc-20353268
""",


    "menstrual-health": """# Menstrual health: what is typical and what is not

Cycle lengths vary from person to person and even from cycle to cycle. A typical
cycle is often described as roughly 21 to 35 days, with bleeding lasting about 2 to
7 days -- but "typical" is a wide range, and your own baseline matters more than a
number.

## What is worth tracking

* Period start and end dates
* Flow intensity (light, medium, heavy)
* Symptoms such as cramps, mood changes, breast tenderness, headaches, or fatigue
* Intermittent bleeding or spotting between periods

## Patterns to discuss with a clinician

* Periods that consistently fall outside your usual range
* Bleeding that soaks through a pad or tampon every hour for several hours
* Periods that stop for several months without pregnancy or another known cause
* Severe pain that interferes with work, school, or daily life
* Bleeding after menopause

Tracking helps you describe your experience clearly to a clinician. It is not a
diagnostic tool on its own.

## References

* CDC -- Reproductive Health: Menstruation
  https://www.cdc.gov/reproductivehealth/menstruation/index.htm
* ACOG -- Menstruation in Girls and Adolescents
  https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2024/02/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign
* Mayo Clinic -- Menstrual cycle
  https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047178
""",
    "pcos-hormonal-health": """# PCOS and hormonal health

Polycystic ovary syndrome (PCOS) is a hormonal condition that can affect periods,
ovulation, skin, hair, and metabolic health. It is common, but it is also commonly
misunderstood.

## Signs that may prompt a conversation with a clinician

* Irregular or absent periods
* Excess facial or body hair, or persistent acne
* Thinning scalp hair
* Difficulty conceiving
* Weight changes or insulin-resistance signs

None of these signs alone means you have PCOS, and having PCOS does not mean you
will have every sign.

## How PCOS is assessed

PCOS is diagnosed by a clinician using a combination of medical history, physical
exam, blood tests, and sometimes ultrasound. There is no single questionnaire, photo,
or home test that diagnoses PCOS. If you think PCOS may be relevant to you, the
right next step is a clinical appointment -- not a self-diagnosis.

## References

* CDC -- Polycystic Ovary Syndrome (PCOS)
  https://www.cdc.gov/reproductivehealth/pcos.htm
* Office on Women's Health -- Polycystic Ovary Syndrome
  https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome
* ACOG -- Polycystic Ovary Syndrome (PCOS)
  https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos
""",


    "preventive-care": """# Preventive care: screenings and checkups

Preventive care is about noticing patterns early, before symptoms become serious.
Which checks make sense depends on your age, history, and risk factors -- a clinician
can help you build a personal schedule.

## Common preventive conversations

* Blood pressure and blood sugar checks
* Iron status and anemia screening, especially with heavy periods or fatigue
* Sexual and reproductive-health screening
* Skin, breast, and cervical-health checks appropriate to your age and history
* Vaccinations, including HPV vaccination where appropriate

## Keep your own notes

Write down dates, results, and questions between appointments. Your own records are
one of the best tools for a productive conversation with a clinician.

## References

* CDC -- Preventive Health Care
  https://www.cdc.gov/prevention/
* U.S. Preventive Services Task Force
  https://www.uspreventiveservicestaskforce.org/
""",
    "when-to-seek-care": """# When to seek medical attention

This list is general guidance, not a replacement for a clinician's judgment. When in
doubt, contact a healthcare professional.

## Contact a clinician soon if you notice

* Persistent, unexplained fatigue or weakness
* Unusually heavy or prolonged menstrual bleeding
* Periods that stop for several months without a known cause
* Severe pelvic pain or pain that interferes with daily life
* Signs of anemia such as pale skin, shortness of breath with ordinary activity, or
  frequent dizziness
* Mood changes, anxiety, or low mood that last for weeks

## Seek urgent care (emergency services or an urgent care clinic) if you experience

* Fainting or loss of consciousness
* Chest pain, especially with shortness of breath
* Severe weakness or confusion
* Very heavy bleeding (soaking through a pad or tampon every hour for several hours)
* Severe abdominal or pelvic pain that comes on suddenly

In an emergency, call your local emergency number (for example, 911 in the United
States) or go to the nearest emergency department.

## References

* MedlinePlus -- Medical Emergencies
  https://medlineplus.gov/medicalemergencies.html
* CDC -- Emergency Preparedness and Response
  https://www.cdc.gov/
""",
}

def _extract_refs(content: str) -> list[str]:
    refs = []
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("https://"):
            refs.append(line)
    return refs


_REFERENCES: dict[str, list[str]] = {aid: _extract_refs(_CONTENT[aid]) for aid in _CONTENT}


@router.get("/education", response_model=list[EducationArticle])
def list_articles():
    return list(_ARTICLES.values())


@router.get("/education/{article_id}", response_model=EducationArticleDetail)
def get_article(article_id: str):
    article = _ARTICLES.get(article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return EducationArticleDetail(
        **article.model_dump(),
        content=_CONTENT.get(article_id, ""),
        references=_REFERENCES.get(article_id, []),
    )