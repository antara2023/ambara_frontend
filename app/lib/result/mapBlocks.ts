// Ported unchanged from Vedaz (vedaz_rmx app/utils/DynamicUIMapper.ts): turns the AI JSON into display blocks,
// with the same Hindi titles, score and favourable-period rules. Keep in sync with Vedaz.
import type { UIBlock, MarkdownBlock } from "./blocks.types";

const HINDI_FIELD_TITLES: Record<string, string> = {
    // Nakshatra & Kundli Specific
    "nakshatra": "नक्षत्र",
    "pada": "चरण / पाद",
    "charan": "चरण",
    "nakshatralord": "नक्षत्र स्वामी",
    "moonrashisignlord": "चंद्र राशि स्वामी",
    "rashisignlord": "राशि स्वामी",
    "rashilord": "राशि स्वामी",
    "rashi": "चंद्र राशि",
    "moonrashi": "चंद्र राशि",
    "sunrashi": "सूर्य राशि",
    "sunsign": "सूर्य राशि",
    "moonsign": "चंद्र राशि",
    "lagna": "लग्न",
    "ascendant": "लग्न",
    "lagnalord": "लग्न स्वामी",
    "lordsaredifferentnote": "नक्षत्र स्वामी व राशि स्वामी अंतर",
    "gana": "गण",
    "rulingdeity": "अधिष्ठाता देवता",
    "deity": "देवता",
    "navamshaconnectionnote": "नवमांश संबंध",
    "yoni": "योनि",
    "varna": "वर्ण",
    "vashya": "वश्य",
    "vasya": "वश्य",
    "nadi": "नाड़ी",
    "tatva": "तत्व",
    "element": "तत्व",
    "padasign": "पाद राशि",
    "padarashi": "पाद राशि",
    "symbol": "प्रतीक / चिन्ह",
    "animal": "पशु प्रतीक",
    "animalsign": "पशु प्रतीक",
    "tree": "आराध्य वृक्ष",
    "bird": "पक्षी",
    "syllables": "नामाक्षर",
    "namingsyllables": "नामाक्षर",
    "padasyllable": "पाद नामाक्षर",

    // Gemstone / Ratna
    "gemstone": "रत्न",
    "recommendedgemstone": "अनुशंसित रत्न",
    "gemstonerecommendation": "अनुशंसित रत्न",
    "substitutegemstone": "उपरत्न (वैकल्पिक रत्न)",
    "substitute": "उपरत्न (वैकल्पिक)",
    "upratna": "उपरत्न",
    "rulingplanet": "स्वामी ग्रह",
    "metalandfinger": "उपयुक्त धातु एवं अंगुली",
    "metal": "धातु",
    "finger": "अंगुली",
    "favorabledayandtime": "धारण का शुभ दिन व समय",
    "wearingday": "धारण का शुभ दिन",
    "wearingtime": "धारण का शुभ समय",
    "mantra": "वैदिक मंत्र",
    "chantingmantra": "जाप मंत्र",
    "carat": "वजन (कैरेट)",
    "weight": "अनुशंसित वजन (रत्ती/कैरेट)",
    "recommendedweight": "अनुशंसित वजन",
    "wearingguidance": "रत्न धारण विधि एवं नियम",
    "wearingrules": "धारण विधि व नियम",
    "careandprecautions": "रखरखाव एवं सावधानियां",
    "precautions": "सावधानियां",
    "reasoningforrecommendationordecline": "रत्न धारण करने या न करने का ज्योतिषीय कारण",
    "reasoning": "ज्योतिषीय कारण एवं विश्लेषण",
    "trialperiodnote": "परीक्षण अवधि व नियम",

    // Manglik / Manglik Dosh
    "manglik": "मांगलिक स्थिति",
    "ismanglik": "मांगलिक दोष स्थिति",
    "manglikstatus": "मांगलिक दोष स्थिति",
    "mangaldosha": "मंगल दोष",
    "severity": "दोष तीव्रता",
    "doshaeffect": "दोष प्रभाव",
    "level": "स्तर",
    "marsplacement": "मंगल की भाव स्थिति",
    "marshouse": "मंगल का भाव",
    "cancellationfactors": "दोष मुक्ति / भंग योग",
    "doshabhangyoga": "दोष भंग योग",
    "cancellation": "दोष परिहार",
    "manglikremedies": "मांगलिक दोष निवारण उपाय",
    "impactonmarriage": "वैवाहिक जीवन पर प्रभाव",
    "marriageimpact": "विवाह पर प्रभाव",

    // Sade Sati
    "sadesatistatus": "साढ़े साती स्थिति",
    "sadesatiphase": "साढ़े साती का चरण",
    "currentphase": "वर्तमान चरण",
    "saturnsign": "शनि राशि",
    "saturnplacement": "शनि की भाव स्थिति",
    "saturnrashi": "गोचर में शनि राशि",
    "impact": "प्रभाव",
    "phaseeffect": "चरण प्रभाव",
    "dhayiyastatus": "ढैय्या स्थिति",
    "dhayya": "ढैय्या",
    "kantakashani": "कंटक शनि",
    "ashtamshani": "अष्टम शनि",
    "shaniupay": "शनि देव उपाय",
    "saturnremedies": "शनि दोष निवारण उपाय",

    // Atmakaraka & Darakaraka / Chara Karaka
    "atmakaraka": "आत्मकारक (आत्मा का ग्रह)",
    "amatyakaraka": "अमात्यकारक (करियर व बुद्धि का ग्रह)",
    "bhratrukaraka": "भ्रातृकारक (भाई-बहन व पराक्रम का ग्रह)",
    "bhratrikaraka": "भ्रातृकारक (भाई-बहन व पराक्रम का ग्रह)",
    "matrukaraka": "मातृकारक (माता व सुख का ग्रह)",
    "matrikaraka": "मातृकारक (माता व सुख का ग्रह)",
    "pitrukaraka": "पितृकारक (पिता व धर्म का ग्रह)",
    "pitrikaraka": "पितृकारक (पिता व धर्म का ग्रह)",
    "gnatikaraka": "ज्ञातिकारक (संघर्ष, रोग व बाधाओं का ग्रह)",
    "darakaraka": "दाराकारक (जीवनसाथी व साझेदारी का ग्रह)",
    "planet": "ग्रह",
    "degree": "अंश (Degree)",
    "formatteddegree": "अंश",
    "sign": "राशि",
    "zodiac": "राशि",
    "signnumber": "राशि संख्या",
    "longitude": "भोगांश",
    "karaka": "कारक पद",
    "description": "ज्योतिषीय विवरण",
    "rankabbr": "संक्षिप्त नाम",
    "isretro": "वक्री स्थिति",
    "retrograde": "वक्री",
    "direct": "मार्गी",
    "soulpurpose": "आत्मा का मूल उद्देश्य",
    "relationshipkarma": "वैवाहिक एवं संबंध कर्म",
    "marriagetiming": "विवाह का शुभ समय",
    "spousecharacteristics": "जीवनसाथी के लक्षण एवं स्वभाव",

    // Vimshottari Dasha
    "currentmahadasha": "वर्तमान महादशा",
    "mahadasha": "महादशा",
    "currentantardasha": "वर्तमान अंतर्दशा",
    "antardasha": "अंतर्दशा",
    "currentpratyantardasha": "वर्तमान प्रत्यंतर्दशा",
    "pratyantardasha": "प्रत्यंतर्दशा",
    "fullmahadashasequence": "सम्पूर्ण महादशा क्रम एवं समयावधि",
    "mahadashasequence": "महादशा क्रम",
    "antardashasequence": "अंतर्दशा क्रम",
    "dashalord": "दशा स्वामी",
    "dashastart": "दशा प्रारंभ",
    "dashaend": "दशा समाप्ति",
    "startdate": "प्रारंभ तिथि",
    "enddate": "समाप्ति तिथि",
    "durationyears": "अवधि (वर्ष)",
    "duration": "अवधि",
    "day": "शुभ दिन",
    "dashaeffects": "दशा फल व प्रभाव",
    "dashainfluence": "दशा प्रभाव",

    // Numerology / Ank Jyotish & Names
    "name": "नाम",
    "username": "नाम",
    "fullname": "पूरा नाम",
    "mulank": "मूलांक",
    "birthnumber": "मूलांक (जन्म संख्या)",
    "bhagyank": "भाग्यांक",
    "destinynumber": "भाग्यांक (भाग्य संख्या)",
    "namank": "नामांक",
    "namenumber": "नामांक",
    "luckynumbers": "शुभ अंक",
    "luckynumber": "शुभ अंक",
    "luckycolors": "शुभ रंग",
    "luckycolor": "शुभ रंग",
    "luckydays": "शुभ दिन",
    "luckyday": "शुभ दिन",
    "unluckynumbers": "अशुभ / वर्जित अंक",
    "enemy": "प्रतिकूल अंक",
    "compatiblecareer": "अनुकूल करियर",

    // Kaal Sarp & Pitru Dosh
    "iskaalsarp": "कालसर्प दोष स्थिति",
    "kaalsarpstatus": "कालसर्प दोष",
    "kaalsarptype": "कालसर्प दोष प्रकार",
    "kaalsarpremedies": "कालसर्प दोष शांति उपाय",
    "ispitrudosh": "पितृ दोष स्थिति",
    "pitrudoshstatus": "पितृ दोष",
    "causes": "दोष के कारण",
    "reasons": "कारण",
    "pitrudoshremedies": "पितृ दोष शांति उपाय",

    // Love & Compatibility
    "lovepercentage": "प्रेम अनुकूलता प्रतिशत",
    "compatibility": "अनुकूलता",
    "compatibilityscore": "संबंध अनुकूलता स्कोर",
    "lovescore": "प्रेम स्कोर",
    "relationshipdynamics": "संबंध तालमेल",
    "returnchance": "वापसी की संभावना",
    "reconciliationtips": "संबंध सुधार के उपाय",

    // Career & Government Job & SSC CGL
    "careerprospects": "करियर एवं पदोन्नति की संभावनाएं",
    "financialgrowth": "आर्थिक स्थिति एवं धन योग",
    "healthandvitality": "स्वास्थ्य एवं ऊर्जा",
    "spiritualguidance": "आध्यात्मिक मार्गदर्शन",
    "lifepath": "जीवन मार्ग एवं कर्म",
    "favorableindustries": "अनुकूल उद्योग / क्षेत्र",
    "suitablefields": "उपयुक्त कार्यक्षेत्र",
    "preparationtips": "तैयारी एवं सफलता के उपाय",
    "timebasedstrategy": "समय आधारित रणनीति",
    "houseandplanetstrengths": "ग्रह और भाव बल",
    "careerstrengthsandopportunities": "करियर की ताकत और अवसर",
    "careerchallengesandwarnings": "करियर की चुनौतियाँ और चेतावनियाँ",
    "keyfocusareas": "मुख्य फोकस क्षेत्र",
    "commonmistakestoavoid": "बचने योग्य गलतियाँ",
    "balancedrecommendation": "संतुलित ज्योतिषीय सलाह",

    // General / Planets / Timeline / Scores
    "astrologicalanalysis": "ज्योतिषीय विश्लेषण",
    "planetaryimpacts": "ग्रहों का प्रभाव एवं लक्षण",
    "planetaryinfluences": "ग्रहों का प्रभाव",
    "planetarydirection": "ग्रहों की दिशा व स्थिति",
    "planetaryblockages": "ग्रह दोष एवं बाधाएं",
    "remedies": "वैदिक उपाय एवं समाधान",
    "astrologicalremedies": "ज्योतिषीय उपाय",
    "remediesandroutine": "उपाय एवं दैनिक दिनचर्या",
    "recommendations": "ज्योतिषीय मार्गदर्शन एवं सलाह",
    "careertips": "करियर सफलता के टिप्स",
    "favourableperiod": "शुभ एवं अनुकूल समय",
    "favorableperiod": "शुभ एवं अनुकूल समय",
    "favorablemonths": "अनुकूल माह एवं समयरेखा",
    "predictiontimeline": "भविष्यवाणी समयरेखा",
    "timeline": "महत्वपूर्ण समयरेखा",
    "yogascore": "शुभ योग स्कोर",
    "score": "स्कोर",
    "probability": "सफलता की संभावना",
    "chance": "संभावना",
    "strengths": "सकारात्मक पक्ष एवं शक्तियां",
    "weaknesses": "कमजोरियां एवं चुनौतियां",
    "challenges": "चुनौतियां एवं सावधानियां",
    "closingnote": "महत्वपूर्ण मार्गदर्शन",
    "ashtakootascore": "अष्टकूट कुल गुण",
    "gunascore": "गुण मिलान स्कोर",
    "grahamaitri": "ग्रह मैत्री",
    "bhakoot": "भकूट",
    "bhakut": "भकूट",

    // Kaal Sarp Specific
    "historicalcontextnote": "ऐतिहासिक संदर्भ एवं पृष्ठभूमि",
    "historicalcontext": "ऐतिहासिक संदर्भ",
    "classicaleffectsassociated": "पारंपरिक शास्त्रीय प्रभाव",
    "classicaleffects": "पारंपरिक प्रभाव",
    "enclosurestatus": "ग्रह घेराव स्थिति",
    "typethemeandassociation": "दोष स्वरूप एवं ज्योतिषीय संबंध",
    "typetheme": "प्रकार व मूल स्वरूप",
    "rahuketustrength": "राहु-केतु प्रभाव एवं शक्ति",
    "rahuandketustrength": "राहु एवं केतु की शक्ति",
    "rahu": "राहु ग्रह प्रभाव",
    "ketu": "केतु ग्रह प्रभाव",

    // Varshphal (Annual Horoscope) Specific
    "varshesh": "वर्षेश (वर्ष का स्वामी ग्रह)",
    "muntha": "मुंथा स्थिति",
    "munthahouse": "मुंथा का भाव",
    "housethisyear": "इस वर्ष का भाव",
    "keysahams": "प्रमुख सहम बिंदु",
    "sahams": "सहम बिंदु",
    "saham": "सहम",
    "dashacontextintegration": "दशा संदर्भ एवं समन्वय",
    "overallyearsummary": "सम्पूर्ण वार्षिक सारांश",
    "yearcalculated": "गणना वर्ष / वर्षफल वर्ष",
    "solarreturnexactmoment": "सौर वर्ष प्रवेश का सटीक समय",
    "solarreturn": "सौर वर्ष प्रवेश",
    "varshaphalsummary": "वर्षफल सम्पूर्ण सारांश",
    "annualforecast": "वार्षिक भविष्यफल",
    "yearlyprediction": "वार्षिक भविष्यवाणी",
    "mudda": "मुद्धा दशा",
    "muddadasha": "मुद्धा दशा",
    "patyayini": "पत्यायिनी दशा",
    "panchavargiyabala": "पंचवर्गीय बल",
    "dwadashavargiyabala": "द्वादशवर्गीय बल",
    "harshabala": "हर्ष बल",
    "tajikayoga": "ताजिक योग",
    "ithasala": "इत्थशाल योग",
    "kamboola": "कम्बूल योग",
    "deeptamsha": "दीप्तांश",

    // Panchang & Muhurat Specific
    "tithi": "तिथि",
    "paksha": "पक्ष",
    "shuklapaksha": "शुक्ल पक्ष",
    "krishnapaksha": "कृष्ण पक्ष",
    "karana": "करण",
    "karan": "करण",
    "vaar": "वार (दिन)",
    "weekday": "वार",
    "sunrise": "सूर्योदय",
    "sunset": "सूर्यास्त",
    "moonrise": "चंद्रोदय",
    "moonset": "चंद्रास्त",
    "shubhmuhurat": "शुभ मुहूर्त",
    "auspiciousmuhurta": "शुभ मुहूर्त",
    "abhijitmuhurat": "अभिजीत मुहूर्त",
    "abhijit": "अभिजीत मुहूर्त",
    "rahukaal": "राहुकाल",
    "rahukal": "राहुकाल",
    "gulikkaal": "गुलिक काल",
    "yamaganda": "यमगंड",
    "brahmamuhurta": "ब्रह्म मुहूर्त",
    "amritkaal": "अमृत काल",
    "durmuhurat": "दुर्मुहूर्त",
    "varjyam": "वर्ज्यम्",
    "choghadiya": "चौघड़िया",

    // Raj Yoga & Planetary Yogas
    "rajyoga": "राजयोग",
    "rajayoga": "राजयोग",
    "gajakesariyoga": "गजकेसरी योग",
    "gajakesari": "गजकेसरी योग",
    "budhadityayoga": "बुधादित्य योग",
    "budhaditya": "बुधादित्य योग",
    "dhanyoga": "धन योग",
    "dhanayoga": "धन योग",
    "panchmahapurushayoga": "पंच महापुरुष योग",
    "panchmahapurusha": "पंच महापुरुष योग",
    "ruchakayoga": "रुचक योग",
    "ruchaka": "रुचक योग",
    "bhadrayoga": "भद्र योग",
    "bhadra": "भद्र योग",
    "hansayoga": "हंस योग",
    "hansa": "हंस योग",
    "malavyayoga": "मालव्य योग",
    "malavya": "मालव्य योग",
    "shashayoga": "शश योग",
    "shasha": "शश योग",
    "vipreetrajyoga": "विपरीत राजयोग",
    "neechbhangrajyoga": "नीचभंग राजयोग",
    "lakshmiyoga": "महालक्ष्मी योग",
    "saraswatiyoga": "सरस्वती योग",
    "parivartanayoga": "परिवर्तन योग",
    "presentyogas": "कुंडली में उपस्थित शुभ योग",
    "yogastrength": "योग बल एवं प्रभाव",
    "yogafruits": "योग फल व लाभ",

    // Gandmool Dosh Specific
    "isgandmool": "गंडमूल दोष स्थिति",
    "gandmooldosh": "गंडमूल दोष",
    "gandmoolstatus": "गंडमूल दोष स्थिति",
    "gandmoolnakshatra": "गंडमूल नक्षत्र",
    "gandmoolpada": "गंडमूल चरण",
    "gandmoolremedies": "गंडमूल शांति उपाय",
    "shantipuja": "शांति पूजा विधान",

    // Ashtakoota & Kundli Milan Specific Doshas
    "nadidosha": "नाड़ी दोष स्थिति",
    "nadiremedies": "नाड़ी दोष निवारण",
    "bhakootdosha": "भकूट दोष स्थिति",
    "bhakootremedies": "भकूट दोष निवारण",
    "ganadosha": "गण दोष",
    "yonidosha": "योनि दोष",
    "ashtakoot": "अष्टकूट मिलान",
    "ashtakoota": "अष्टकूट मिलान",
    "manglikcompatibility": "मांगलिक सामंजस्य",

    // SSC CGL & Competitive Exam Specific
    "selectedposts": "अनुकूल पद एवं विभाग",
    "suitableposts": "उपयुक्त सरकारी पद",
    "tier1preparation": "टियर-1 परीक्षा तैयारी",
    "tier2preparation": "टियर-2 परीक्षा तैयारी",
    "interviewguidance": "साक्षात्कार मार्गदर्शन",
    "promotions": "पदोन्नति की संभावनाएं",
    "promotionstimeline": "पदोन्नति समयरेखा",

    // Kundli Planets & Houses
    "house": "भाव",
    "bhava": "भाव",
    "houseplacement": "भाव स्थिति",
    "aspects": "दृष्टि संबंध",
    "drishti": "दृष्टि",
    "combustion": "अस्त स्थिति",
    "iscombust": "अस्त ग्रह",
    "combust": "अस्त",
    "exalted": "उच्च स्थिति",
    "uccha": "उच्च",
    "debilitated": "नीच स्थिति",
    "neecha": "नीच",
    "ownhouse": "स्वराशि स्थिति",
    "swakshetra": "स्वराशि",
    "sun": "सूर्य",
    "surya": "सूर्य",
    "moon": "चंद्रमा",
    "chandra": "चंद्रमा",
    "mars": "मंगल",
    "mangal": "मंगल",
    "mercury": "बुध",
    "budha": "बुध",
    "budh": "बुध",
    "jupiter": "बृहस्पति (गुरु)",
    "guru": "बृहस्पति (गुरु)",
    "brihaspati": "बृहस्पति",
    "venus": "शुक्र",
    "shukra": "शुक्र",
    "saturn": "शनि",
    "shani": "शनि",
    "details": "विवरण"
};

const HINDI_WORD_DICT: Record<string, string> = {
    // Varshphal & General Astrology
    "varshesh": "वर्षेश",
    "muntha": "मुंथा",
    "saham": "सहम",
    "sahams": "सहम",
    "solar": "सौर",
    "return": "प्रवेश",
    "returns": "प्रवेश",
    "exact": "सटीक",
    "moment": "समय",
    "calculated": "गणना",
    "calculate": "गणना",
    "overall": "सम्पूर्ण",
    "this": "इस",
    "that": "उस",
    "annual": "वार्षिक",
    "yearly": "वार्षिक",
    "year": "वर्ष",
    "years": "वर्ष",
    "integration": "समन्वय",
    "context": "संदर्भ",
    "summary": "सारांश",
    "overview": "अवलोकन",
    "historical": "ऐतिहासिक",
    "note": "विवरण",
    "notes": "विवरण",
    "classical": "पारंपरिक",
    "effects": "प्रभाव",
    "effect": "प्रभाव",
    "associated": "संबंधी",
    "enclosure": "घेराव",
    "status": "स्थिति",
    "type": "प्रकार",
    "theme": "स्वरूप",
    "association": "संबंध",
    "associations": "संबंध",
    "strength": "शक्ति व प्रभाव",
    "strengths": "शक्तियां",
    "power": "प्रभाव",
    "remedy": "उपाय",
    "remedies": "वैदिक उपाय",
    "analysis": "विश्लेषण",
    "impact": "प्रभाव",
    "impacts": "प्रभाव",
    "influence": "प्रभाव",
    "influences": "प्रभाव",
    "direction": "दिशा",
    "blockage": "बाधा",
    "blockages": "दोष व बाधाएं",
    "recommendation": "मार्गदर्शन",
    "recommendations": "मार्गदर्शन एवं सलाह",
    "guidance": "मार्गदर्शन",
    "guidelines": "नियम व विधि",
    "tips": "सलाह",
    "timeline": "समयरेखा",
    "score": "स्कोर",
    "probability": "संभावना",
    "chance": "संभावना",
    "weakness": "कमजोरी",
    "weaknesses": "कमजोरियां",
    "challenge": "चुनौती",
    "challenges": "चुनौतियां",
    "warning": "सावधानी",
    "warnings": "चेतावनियां",
    "opportunity": "अवसर",
    "opportunities": "अवसर",
    "strategy": "रणनीति",
    "focus": "मुख्य",
    "area": "क्षेत्र",
    "areas": "क्षेत्र",
    "mistake": "गलती",
    "mistakes": "गलतियां",
    "avoid": "बचने योग्य",
    "traits": "विशेषताएं",
    "characteristics": "लक्षण",
    "nature": "स्वभाव",
    "result": "परिणाम",
    "results": "परिणाम",
    "details": "विवरण",
    "detail": "विवरण",
    "key": "प्रमुख",
    "keys": "प्रमुख",
    "lord": "स्वामी",
    "lords": "स्वामी",
    "ruling": "अधिष्ठाता",
    "deity": "देवता",
    "connection": "संबंध",
    "navamsha": "नवमांश",
    "house": "भाव",
    "houses": "भाव",
    "planet": "ग्रह",
    "planets": "ग्रह",
    "aspect": "दृष्टि",
    "aspects": "दृष्टि",
    "sign": "राशि",
    "signs": "राशि",
    "degree": "अंश",
    "degrees": "अंश",
    "pada": "चरण",
    "charan": "चरण",
    "gana": "गण",
    "yoni": "योनि",
    "varna": "वर्ण",
    "vashya": "वश्य",
    "vasya": "वश्य",
    "nadi": "नाड़ी",
    "tatva": "तत्व",
    "element": "तत्व",
    "nakshatra": "नक्षत्र",
    "gemstone": "रत्न",
    "substitute": "उपरत्न",
    "metal": "धातु",
    "finger": "अंगुली",
    "day": "दिन",
    "days": "दिन",
    "time": "समय",
    "timing": "समय",
    "favorable": "शुभ व अनुकूल",
    "favourable": "शुभ व अनुकूल",
    "unfavorable": "प्रतिकूल",
    "mantra": "मंत्र",
    "carat": "कैरेट",
    "weight": "वजन",
    "precautions": "सावधानियां",
    "precaution": "सावधानी",
    "care": "देखभाल",
    "routine": "दिनचर्या",
    "marriage": "विवाह",
    "marital": "वैवाहिक",
    "relationship": "संबंध",
    "relationships": "संबंध",
    "career": "करियर",
    "job": "नौकरी",
    "government": "सरकारी",
    "govt": "सरकारी",
    "business": "व्यापार",
    "financial": "आर्थिक",
    "finance": "धन",
    "wealth": "धन",
    "growth": "विकास",
    "expansion": "विस्तार",
    "positive": "सकारात्मक",
    "development": "विकास",
    "travel": "यात्रा",
    "foreign": "विदेश",
    "abroad": "विदेश",
    "gain": "लाभ",
    "gains": "लाभ",
    "prosperity": "समृद्धि",
    "partnership": "साझेदारी",
    "health": "स्वास्थ्य",
    "vitality": "ऊर्जा",
    "spiritual": "आध्यात्मिक",
    "spirituality": "आध्यात्म",
    "life": "जीवन",
    "path": "मार्ग",
    "karma": "कर्म",
    "purpose": "उद्देश्य",
    "soul": "आत्मा",
    "dosha": "दोष",
    "dosh": "दोष",
    "yoga": "योग",
    "dasha": "दशा",
    "mahadasha": "महादशा",
    "antardasha": "अंतर्दशा",
    "pratyantardasha": "प्रत्यंतर्दशा",
    "period": "काल / चरण",
    "phase": "चरण",
    "compatibility": "अनुकूलता",
    "spouse": "जीवनसाथी",
    "partner": "जीवनसाथी",
    "name": "नाम",
    "names": "नाम",
    "fullname": "पूरा नाम",
    "age": "आयु",
    "month": "माह",
    "months": "माह",
    "date": "तिथि",
    "dates": "तिथियां",
    "start": "प्रारंभ",
    "end": "समाप्ति",
    "duration": "समयावधि",
    "level": "स्तर",
    "severity": "तीव्रता",
    "cancellation": "दोष मुक्ति / परिहार",
    "factors": "कारक",
    "reconciliation": "सुधार",
    "kaalsarp": "कालसर्प दोष",
    "kaal": "काल",
    "sarp": "सर्प",
    "sarpa": "सर्प",
    "manglik": "मांगलिक",
    "mangal": "मंगल",
    "sadesati": "साढ़े साती",
    "sade": "साढ़े",
    "sati": "साती",
    "shani": "शनि",
    "saturn": "शनि",
    "rahu": "राहु",
    "ketu": "केतु",
    "sun": "सूर्य",
    "surya": "सूर्य",
    "moon": "चंद्रमा",
    "chandra": "चंद्रमा",
    "mars": "मंगल",
    "mercury": "बुध",
    "budh": "बुध",
    "jupiter": "गुरु (बृहस्पति)",
    "guru": "गुरु",
    "venus": "शुक्र",
    "shukra": "शुक्र",
    "tithi": "तिथि",
    "paksha": "पक्ष",
    "karana": "करण",
    "karan": "करण",
    "vaar": "वार",
    "muhurat": "मुहूर्त",
    "muhurta": "मुहूर्त",
    "choghadiya": "चौघड़िया",
    "rajyoga": "राजयोग",
    "gandmool": "गंडमूल",
    "pitru": "पितृ",
    "pitra": "पितृ",
    "post": "पद",
    "posts": "पद",
    "exam": "परीक्षा",
    "preparation": "तैयारी",
    "prep": "तैयारी",
    "tier": "टियर",
    "interview": "साक्षात्कार",
    "promotion": "पदोन्नति",
    "promotions": "पदोन्नति",
    "suitable": "उपयुक्त",
    "selected": "अनुकूल",
    "present": "उपस्थित",
    "presence": "उपस्थिति",
    "fruit": "फल",
    "fruits": "फल"
};

const getLocalizedTitle = (key: string, defaultTitle: string, isHi: boolean): string => {
    if (!isHi) return defaultTitle;
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 1. Direct exact match in dictionary
    if (HINDI_FIELD_TITLES[cleanKey]) {
        return HINDI_FIELD_TITLES[cleanKey];
    }
    if (HINDI_WORD_DICT[cleanKey]) {
        return HINDI_WORD_DICT[cleanKey];
    }
    
    // 2. Check stripped key
    const strippedKey = cleanKey
        .replace(/^(user|calc|calculator|kundli|astro|birth)/, '')
        .replace(/(details|info|score|data|result|note)$/, '');
    if (strippedKey && HINDI_FIELD_TITLES[strippedKey]) {
        return HINDI_FIELD_TITLES[strippedKey];
    }
    if (strippedKey && HINDI_WORD_DICT[strippedKey]) {
        return HINDI_WORD_DICT[strippedKey];
    }

    // 3. Smart Word-by-Word Decomposition
    const words = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_\-\.]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);

    if (words.length > 0) {
        let matchCount = 0;
        const translatedWords = words.map(w => {
            const cleanW = w.replace(/[^a-z0-9]/g, '');
            if (cleanW === 'and' || cleanW === 'with') return 'व';
            if (cleanW === 'or') return 'या';
            if (cleanW === 'of' || cleanW === 'the' || cleanW === 'for' || cleanW === 'in' || cleanW === 'to') return '';
            if (cleanW === 'this') return 'इस';
            if (cleanW === 'that') return 'उस';
            
            if (HINDI_FIELD_TITLES[cleanW]) {
                matchCount++;
                return HINDI_FIELD_TITLES[cleanW];
            }
            if (HINDI_WORD_DICT[cleanW]) {
                matchCount++;
                return HINDI_WORD_DICT[cleanW];
            }
            if (cleanW.endsWith('s') && HINDI_WORD_DICT[cleanW.slice(0, -1)]) {
                matchCount++;
                return HINDI_WORD_DICT[cleanW.slice(0, -1)];
            }
            return w;
        }).filter(w => w.length > 0);

        if (matchCount > 0) {
            return translatedWords.join(' ');
        }
    }

    // 4. Substring fallback (only if cleanKey contains dictKey and cleanKey is longer)
    for (const [dictKey, dictVal] of Object.entries(HINDI_FIELD_TITLES)) {
        if (dictKey.length >= 4 && cleanKey.length > dictKey.length && cleanKey.includes(dictKey)) {
            return dictVal;
        }
    }
    return defaultTitle;
};

const ensureScoreBlockAndFavorablePeriod = (
    blocks: UIBlock[],
    resultJson: any,
    isHi: boolean,
    calculatorName?: string,
    userName?: string,
    userDob?: string,
    calculatorId?: string
) => {
    let scoreBlockIndex = blocks.findIndex(b => b.type === 'score');
    let scoreBlock: any;

    const cleanCalcName = calculatorName ? calculatorName.replace(/\b(Calculator|Result|कैलकुलेटर|परिणाम)\b/gi, '').trim() : '';
    
    let scoreTitle = isHi
        ? `${cleanCalcName || 'ज्योतिषीय अनुकूलता'} स्कोर`
        : `${cleanCalcName || 'Calculator'} Score`;

    if (isHi && calculatorId) {
        const hindiScoreTitles: Record<string, string> = {
            'gemstone': 'रत्न अनुकूलता स्कोर',
            'ratna': 'रत्न अनुकूलता स्कोर',
            'atmakaraka': 'आत्मकारक योग स्कोर',
            'darakaraka': 'दाराकारक अनुकूलता स्कोर',
            'vimshottari-dasha': 'दशा प्रभाव स्कोर',
            'mangalik-dosh': 'मांगलिक प्रभाव स्कोर',
            'sade-sati': 'साढ़े साती प्रभाव स्कोर',
            'nakshatra': 'नक्षत्र अनुकूलता स्कोर',
        };
        if (hindiScoreTitles[calculatorId]) {
            scoreTitle = hindiScoreTitles[calculatorId];
        }
    }

    let scoreValue = 75;
    if (scoreBlockIndex !== -1) {
        scoreBlock = blocks[scoreBlockIndex];
        scoreValue = Number(scoreBlock.score) || 75;
    } else {
        const possibleScoreKeys = ['yogaScore', 'score', 'probability', 'chance', 'percentage', 'value', 'compatibilityScore'];
        for (const key of possibleScoreKeys) {
            if (resultJson[key] !== undefined && (typeof resultJson[key] === 'number' || !isNaN(Number(resultJson[key])))) {
                scoreValue = Number(resultJson[key]);
                break;
            }
        }
    }

    const favPeriod = resultJson.favourablePeriod || resultJson.favorablePeriod;
    const isFavPeriodString = favPeriod && !Array.isArray(favPeriod);
    const timelineEvent = resultJson.timeline && Array.isArray(resultJson.timeline) && resultJson.timeline.length > 0
        ? resultJson.timeline[0]
        : null;

    let favorableTitle = timelineEvent ? timelineEvent.title : (isFavPeriodString ? (isHi ? 'शुभ एवं अनुकूल समय' : 'Favorable Period') : undefined);
    let favorableDescription = timelineEvent ? timelineEvent.description : (isFavPeriodString ? favPeriod : undefined);
    let favorableMonths = timelineEvent ? timelineEvent.date : (resultJson.favorableMonths || resultJson.favorableTimeline);

    if (!favorableDescription) {
        favorableTitle = isHi ? 'शुभ एवं अनुकूल समय' : 'Favorable Period';
        favorableDescription = isHi
            ? 'आपकी कुंडली और ग्रहों के गोचर के अनुसार वर्तमान समय अनुकूल है।'
            : 'According to your planetary positions, the current period is favorable.';
    }

    const updatedScoreBlock = {
        type: 'score' as const,
        title: scoreTitle,
        score: scoreValue,
        maxScore: 100,
        favorableMonths,
        favorableTitle,
        favorableDescription,
    };

    if (scoreBlockIndex !== -1) {
        blocks.splice(scoreBlockIndex, 1);
    }
    blocks.unshift(updatedScoreBlock);
};

export const mapCalculatorResultToBlocks = (
    calculatorId: string,
    resultJson: any,
    isHi: boolean = false,
    calculatorName?: string,
    userName?: string,
    userDob?: string
): UIBlock[] => {
    if (!resultJson || typeof resultJson !== 'object') {
        return [];
    }

    const blocks: UIBlock[] = [];

    // Helper to add generic object properties
    const addGenericBlocks = (jsonObj: any) => {
        const keyValueData: Record<string, string | number | boolean> = {};

        for (const [key, value] of Object.entries(jsonObj)) {
            // Skip nulls/undefined
            if (value === null || value === undefined) continue;

            // Format key: camelCase to Title Case
            const defaultFormattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase());

            const formattedKey = getLocalizedTitle(key, defaultFormattedKey, isHi);

            const lowerKey = key.toLowerCase();
            const isScoreKey = (lowerKey.includes('score') || lowerKey.includes('chance') || lowerKey.includes('probability') || lowerKey.includes('percentage'))
                && !lowerKey.includes('prep')
                && !lowerKey.includes('tayari')
                && !lowerKey.includes('mock');

            if (isScoreKey && (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== ''))) {
                blocks.push({
                    type: 'score',
                    title: formattedKey,
                    score: Number(value),
                    maxScore: 100
                });
                continue;
            }

            const isTimelineKey = lowerKey.includes('timeline') || lowerKey.includes('milestone');
            if (isTimelineKey && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                const events = value.map((item: any) => ({
                    date: String(item.time || item.date || item.age || item.year || ''),
                    title: String(item.title || item.event || ''),
                    description: String(item.description || item.detail || item.summary || '')
                }));
                blocks.push({
                    type: 'timeline',
                    title: formattedKey,
                    events
                });
                continue;
            }

            if (typeof value === 'string') {
                if (value.includes('\n') || value.length > 100) {
                    blocks.push({
                        type: 'markdown',
                        title: formattedKey,
                        content: value
                    });
                } else {
                    keyValueData[formattedKey] = value;
                }
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                keyValueData[formattedKey] = value;
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'string') {
                    blocks.push({
                        type: 'list',
                        title: formattedKey,
                        items: value as string[]
                    });
                } else if (value.length > 0 && typeof value[0] === 'object') {
                    // Complex array - check if it looks like a timeline
                    const isTimeline = value.every(v => v.title && (v.date || v.description));
                    if (isTimeline) {
                        blocks.push({
                            type: 'timeline',
                            title: formattedKey,
                            events: value.map(v => ({
                                title: v.title || '',
                                date: v.date || v.year || '',
                                description: v.description || v.details || ''
                            }))
                        });
                    } else {
                        const markdownItems = value.map(v => {
                            if (!v || typeof v !== 'object') return String(v);
                            return Object.entries(v)
                                .map(([k, val]) => {
                                    const defaultK = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    const formattedK = getLocalizedTitle(k, defaultK, isHi);
                                    const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
                                    return `**${formattedK}**: ${valStr}`;
                                })
                                .join(' | ');
                        });
                        blocks.push({
                            type: 'markdown',
                            title: formattedKey,
                            content: markdownItems.map(item => `- ${item}`).join('\n')
                        });
                    }
                }
            } else if (typeof value === 'object') {
                // Nested object
                let hasComplexOrLong = false;
                for (const nValue of Object.values(value)) {
                    if (nValue === null || nValue === undefined) continue;
                    if (typeof nValue === 'object') {
                        hasComplexOrLong = true;
                        break;
                    }
                    if (typeof nValue === 'string' && (nValue.includes('\n') || nValue.length > 100)) {
                        hasComplexOrLong = true;
                        break;
                    }
                }

                if (hasComplexOrLong) {
                    for (const [dKey, dValue] of Object.entries(value)) {
                        const formattedDKey = dKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const localizedDKey = getLocalizedTitle(dKey, formattedDKey, isHi);
                        addGenericBlocks({ [`${formattedKey} - ${localizedDKey}`]: dValue });
                    }
                } else {
                    const nestedData: Record<string, string | number | boolean> = {};
                    for (const [nKey, nValue] of Object.entries(value)) {
                        if (nValue === null || nValue === undefined) continue;
                        if (typeof nValue === 'string' || typeof nValue === 'number' || typeof nValue === 'boolean') {
                            const defaultKey = nKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            nestedData[getLocalizedTitle(nKey, defaultKey, isHi)] = nValue;
                        }
                    }
                    if (Object.keys(nestedData).length > 0) {
                        blocks.push({
                            type: 'key-value',
                            title: formattedKey,
                            data: nestedData
                        });
                    }
                }
            }
        }

        if (Object.keys(keyValueData).length > 0) {
            blocks.push({
                type: 'key-value',
                title: isHi ? 'विवरण' : 'Details',
                data: keyValueData
            });
        }
    };

    // Sarkari Naukri schemas
    if (resultJson.yogaScore !== undefined) {
        const timelineEvent = resultJson.timeline && Array.isArray(resultJson.timeline) && resultJson.timeline.length > 0
            ? resultJson.timeline[0]
            : null;

        const favPeriod = resultJson.favourablePeriod || resultJson.favorablePeriod;
        const isFavPeriodString = favPeriod && !Array.isArray(favPeriod);

        blocks.push({
            type: 'score',
            title: isHi ? 'चयन की संभावना' : 'Probability of Selection',
            score: resultJson.yogaScore,
            maxScore: 100,
            favorableMonths: timelineEvent ? timelineEvent.date : (resultJson.favorableMonths || resultJson.favorableTimeline),
            favorableScore: resultJson.favorableScore,
            favorableTitle: timelineEvent ? timelineEvent.title : (isFavPeriodString ? (isHi ? 'अनुकूल समय (Favorable Period)' : 'Favorable Period') : undefined),
            favorableDescription: timelineEvent ? timelineEvent.description : (isFavPeriodString ? favPeriod : undefined)
        });

        if (resultJson.preparationScore !== undefined) {
            blocks.push({
                type: 'score',
                title: isHi ? 'तैयारी का स्तर' : 'Preparation Score',
                score: resultJson.preparationScore,
                maxScore: 100,
            });
        }

        if (favPeriod && Array.isArray(favPeriod)) {
            blocks.push({
                type: 'list',
                title: isHi ? 'अनुकूल समय' : 'Favourable Period',
                items: favPeriod,
                icon: 'Calendar'
            });
        }

        if (resultJson.astrologicalAnalysis) {
            blocks.push({
                type: 'markdown',
                title: isHi ? 'ज्योतिषीय विश्लेषण' : 'Astrological Analysis',
                content: resultJson.astrologicalAnalysis,
                icon: 'Compass'
            });
        }

        if (resultJson.timeBasedStrategy) {
            blocks.push({
                type: 'markdown',
                title: isHi ? 'समय आधारित रणनीति' : 'Time Based Strategy',
                content: resultJson.timeBasedStrategy,
                icon: 'Compass'
            });
        }

        if (resultJson.houseAndPlanetStrengths) {
            blocks.push({
                type: 'key-value',
                title: isHi ? 'ग्रह और भाव बल' : 'House & Planet Strengths',
                data: resultJson.houseAndPlanetStrengths
            });
        }

        if (resultJson.careerStrengthsAndOpportunities) {
            blocks.push({
                type: 'markdown',
                title: isHi ? 'करियर की ताकत और अवसर' : 'Strengths & Opportunities',
                content: resultJson.careerStrengthsAndOpportunities,
                icon: 'Target'
            });
        }

        if (resultJson.careerChallengesAndWarnings) {
            blocks.push({
                type: 'list',
                title: isHi ? 'चुनौतियाँ और चेतावनियाँ' : 'Challenges & Warnings',
                items: Array.isArray(resultJson.careerChallengesAndWarnings) ? resultJson.careerChallengesAndWarnings : [resultJson.careerChallengesAndWarnings]
            });
        }

        if (resultJson.keyFocusAreas) {
            blocks.push({
                type: 'markdown',
                title: isHi ? 'मुख्य फोकस क्षेत्र' : 'Key Focus Areas',
                content: resultJson.keyFocusAreas,
                icon: 'Target'
            });
        }

        if (resultJson.astrologicalRemedies || resultJson.remediesAndRoutine) {
            blocks.push({
                type: 'markdown',
                title: isHi ? 'ज्योतिषीय उपाय' : 'Astrological Remedies',
                content: resultJson.astrologicalRemedies || resultJson.remediesAndRoutine,
                icon: 'Sparkles'
            });
        }

        if (resultJson.commonMistakesToAvoid) {
            const mistakes = resultJson.commonMistakesToAvoid;
            if (Array.isArray(mistakes)) {
                blocks.push({
                    type: 'list',
                    title: isHi ? 'बचने योग्य गलतियाँ' : 'Mistakes to Avoid',
                    items: mistakes,
                    icon: 'AlertTriangle'
                });
            } else {
                blocks.push({
                    type: 'markdown',
                    title: isHi ? 'बचने योग्य गलतियाँ' : 'Mistakes to Avoid',
                    content: mistakes,
                    icon: 'AlertTriangle'
                });
            }
        }

        // Map any extra keys that might have been added to the Llama prompt dynamically
        const unhandledData = { ...resultJson };
        delete unhandledData.yogaScore;
        delete unhandledData.planetaryDirection;
        delete unhandledData.favorableMonths;
        delete unhandledData.favorableTimeline;
        delete unhandledData.favorableScore;
        delete unhandledData.preparationScore;
        delete unhandledData.astrologicalAnalysis;
        delete unhandledData.keyFocusAreas;
        delete unhandledData.timeline;
        delete unhandledData.remediesAndRoutine;
        delete unhandledData.astrologicalRemedies;
        delete unhandledData.commonMistakesToAvoid;
        delete unhandledData.closingNote;
        delete unhandledData.userProfile;
        delete unhandledData.partnerProfile; // Ambara: second person of compatibility calculators
        delete unhandledData.timeBasedStrategy;
        delete unhandledData.houseAndPlanetStrengths;
        delete unhandledData.careerStrengthsAndOpportunities;
        delete unhandledData.careerChallengesAndWarnings;
        delete unhandledData.balancedRecommendation;
        delete unhandledData.favourablePeriod;
        delete unhandledData.favorablePeriod;

        if (Object.keys(unhandledData).length > 0) {
            addGenericBlocks(unhandledData);
        }

        if (resultJson.balancedRecommendation) {
            blocks.push({
                type: 'alert',
                title: isHi ? 'संतुलित सलाह' : 'Balanced Recommendation',
                severity: 'info',
                content: resultJson.balancedRecommendation
            });
        }

        // Closing note must be the very last element
        if (resultJson.closingNote) {
            blocks.push({
                type: 'alert',
                title: isHi ? 'ध्यान दें' : 'Note',
                severity: 'info',
                content: resultJson.closingNote
            });
        }

        ensureScoreBlockAndFavorablePeriod(blocks, resultJson, isHi, calculatorName, userName, userDob, calculatorId);
        return blocks;
    }

    // Default Fallback for old simple schema (astrologicalAnalysis, planetaryImpacts, remedies)
    // Checking for userProfile as well since backend adds it
    if (resultJson.astrologicalAnalysis && resultJson.planetaryImpacts && resultJson.remedies && Object.keys(resultJson).length <= 5) {
        blocks.push({
            type: 'markdown',
            title: isHi ? "ब्रह्मांडीय ज्योतिष विश्लेषण" : "Astrological Cosmic Analysis",
            content: resultJson.astrologicalAnalysis,
            icon: 'Compass'
        });
        blocks.push({
            type: 'markdown',
            title: isHi ? "ग्रहों का प्रभाव और लक्षण" : "Planetary Impacts & Traits",
            content: resultJson.planetaryImpacts,
            icon: 'AlertTriangle'
        });
        blocks.push({
            type: 'markdown',
            title: isHi ? "ज्योतिषीय उपाय" : "Astrological Remedies",
            content: resultJson.remedies,
            icon: 'Sparkles'
        });
        ensureScoreBlockAndFavorablePeriod(blocks, resultJson, isHi, calculatorName, userName, userDob, calculatorId);
        return blocks;
    }

    // Generic schema handling (for the 14 new astrology calculators)
    addGenericBlocks(resultJson);

    // If there's a specific closingNote, extract it into an alert block at the end
    const closingNoteIndex = blocks.findIndex(b => b.title === 'Closing Note' || b.title === 'महत्वपूर्ण मार्गदर्शन' || b.title === 'महत्वपूर्ण सूचना' || b.title === 'Important Note');
    if (closingNoteIndex !== -1) {
        const closingBlock = blocks.splice(closingNoteIndex, 1)[0] as MarkdownBlock;
        blocks.push({
            type: 'alert',
            severity: 'info',
            title: isHi ? 'महत्वपूर्ण मार्गदर्शन एवं सूचना' : 'Important Note',
            content: closingBlock.content || (closingBlock as any).data?.['Closing Note'] || ''
        });
    }

    ensureScoreBlockAndFavorablePeriod(blocks, resultJson, isHi, calculatorName, userName, userDob, calculatorId);
    return blocks;
};
