// AGW HET Lineages — curated dataset (first cut for review).
// Evidence is two-track: t:'ms' = manuscript provenance (loesch-briefe-metro),
//   t:'ref' = standard HET reference (cite to be confirmed by DB).
// Names follow ADR-014: never translated. w = approx manuscript index hits.
window.AGW = window.AGW || {};
AGW.LINEAGE = {
 "figures": [
  {
   "id": "smith",
   "name": "Smith",
   "full": "Adam Smith",
   "b": 1723,
   "d": 1790,
   "lane": "klassik",
   "w": 0,
   "de": "Klassische Nationalökonomie",
   "en": "Classical political economy"
  },
  {
   "id": "ricardo",
   "name": "Ricardo",
   "full": "David Ricardo",
   "b": 1772,
   "d": 1823,
   "lane": "klassik",
   "w": 0,
   "de": "Klassik; Werttheorie",
   "en": "Classical; value theory"
  },
  {
   "id": "malthus",
   "name": "Malthus",
   "full": "Thomas R. Malthus",
   "b": 1766,
   "d": 1834,
   "lane": "klassik",
   "w": 0,
   "de": "Bevölkerungslehre",
   "en": "Population theory"
  },
  {
   "id": "mill",
   "name": "Mill",
   "full": "John Stuart Mill",
   "b": 1806,
   "d": 1873,
   "lane": "klassik",
   "w": 0,
   "de": "Klassische Synthese",
   "en": "Classical synthesis"
  },
  {
   "id": "marx",
   "name": "Marx",
   "full": "Karl Marx",
   "b": 1818,
   "d": 1883,
   "lane": "klassik",
   "w": 0,
   "de": "Kritik der politischen Ökonomie",
   "en": "Critique of political economy"
  },
  {
   "id": "list",
   "name": "List",
   "full": "Friedrich List",
   "b": 1789,
   "d": 1846,
   "lane": "klassik",
   "w": 0,
   "de": "Nationales System; Vorläufer der Hist. Schule",
   "en": "National system; forerunner of the Historical School"
  },
  {
   "id": "roscher",
   "name": "Roscher",
   "full": "Wilhelm Roscher",
   "b": 1817,
   "d": 1894,
   "lane": "hist",
   "w": 0,
   "de": "Ältere Historische Schule",
   "en": "Older Historical School"
  },
  {
   "id": "hildebrand",
   "name": "Hildebrand",
   "full": "Bruno Hildebrand",
   "b": 1812,
   "d": 1878,
   "lane": "hist",
   "w": 0,
   "de": "Ältere Hist. Schule; Stufenlehre",
   "en": "Older Historical School; stage theory"
  },
  {
   "id": "knies",
   "name": "Knies",
   "full": "Karl Knies",
   "b": 1821,
   "d": 1898,
   "lane": "hist",
   "w": 1,
   "de": "Ältere Historische Schule",
   "en": "Older Historical School"
  },
  {
   "id": "schmoller",
   "name": "Schmoller",
   "full": "Gustav von Schmoller",
   "b": 1838,
   "d": 1917,
   "lane": "hist",
   "w": 12,
   "de": "Jüngere Hist. Schule; VfS-Mitbegründer",
   "en": "Younger Historical School; VfS co-founder"
  },
  {
   "id": "brentano",
   "name": "Brentano",
   "full": "Lujo Brentano",
   "b": 1844,
   "d": 1931,
   "lane": "hist",
   "w": 0,
   "de": "Jüngere Hist. Schule; Sozialpolitik",
   "en": "Younger Historical School; social policy"
  },
  {
   "id": "buecher",
   "name": "Bücher",
   "full": "Karl Bücher",
   "b": 1847,
   "d": 1930,
   "lane": "hist",
   "w": 0,
   "de": "Stufentheorie der Volkswirtschaft",
   "en": "Stage theory of the economy"
  },
  {
   "id": "wagner",
   "name": "Wagner",
   "full": "Adolph Wagner",
   "b": 1835,
   "d": 1917,
   "lane": "hist",
   "w": 0,
   "de": "Staatssozialismus; Finanzwissenschaft",
   "en": "State socialism; public finance"
  },
  {
   "id": "sombart",
   "name": "Sombart",
   "full": "Werner Sombart",
   "b": 1863,
   "d": 1941,
   "lane": "hist",
   "w": 5,
   "de": "Jüngste Hist. Schule; Kapitalismusanalyse",
   "en": "Youngest Historical School; capitalism"
  },
  {
   "id": "mweber",
   "name": "Weber, Max",
   "full": "Max Weber",
   "b": 1864,
   "d": 1920,
   "lane": "hist",
   "w": 8,
   "de": "Verstehende Soziologie; Methodenlehre",
   "en": "Interpretive sociology; methodology"
  },
  {
   "id": "spiethoff",
   "name": "Spiethoff",
   "full": "Arthur Spiethoff",
   "b": 1873,
   "d": 1957,
   "lane": "hist",
   "w": 111,
   "de": "Konjunkturtheorie; Habil.-Vater Löschs",
   "en": "Business cycles; Lösch's Habilitation supervisor"
  },
  {
   "id": "jevons",
   "name": "Jevons",
   "full": "William S. Jevons",
   "b": 1835,
   "d": 1882,
   "lane": "aut",
   "w": 0,
   "de": "Grenznutzenrevolution",
   "en": "Marginal revolution"
  },
  {
   "id": "walras",
   "name": "Walras",
   "full": "Léon Walras",
   "b": 1834,
   "d": 1910,
   "lane": "aut",
   "w": 0,
   "de": "Allg. Gleichgewicht; Lausanne",
   "en": "General equilibrium; Lausanne"
  },
  {
   "id": "pareto",
   "name": "Pareto",
   "full": "Vilfredo Pareto",
   "b": 1848,
   "d": 1923,
   "lane": "aut",
   "w": 0,
   "de": "Lausanner Schule; Wohlfahrt",
   "en": "Lausanne School; welfare"
  },
  {
   "id": "menger",
   "name": "Menger",
   "full": "Carl Menger",
   "b": 1840,
   "d": 1921,
   "lane": "aut",
   "w": 4,
   "de": "Begründer der Österr. Schule",
   "en": "Founder of the Austrian School"
  },
  {
   "id": "boehm",
   "name": "Böhm-Bawerk",
   "full": "Eugen von Böhm-Bawerk",
   "b": 1851,
   "d": 1914,
   "lane": "aut",
   "w": 0,
   "de": "Österr. Schule; Kapitaltheorie",
   "en": "Austrian School; capital theory"
  },
  {
   "id": "wieser",
   "name": "Wieser",
   "full": "Friedrich von Wieser",
   "b": 1851,
   "d": 1926,
   "lane": "aut",
   "w": 8,
   "de": "Österr. Schule; Grenznutzen",
   "en": "Austrian School; marginal utility"
  },
  {
   "id": "mises",
   "name": "Mises",
   "full": "Ludwig von Mises",
   "b": 1881,
   "d": 1973,
   "lane": "aut",
   "w": 3,
   "de": "Österr. Schule; Praxeologie",
   "en": "Austrian School; praxeology"
  },
  {
   "id": "hayek",
   "name": "Hayek",
   "full": "Friedrich von Hayek",
   "b": 1899,
   "d": 1992,
   "lane": "aut",
   "w": 8,
   "de": "Österr. Schule; Wissensordnung",
   "en": "Austrian School; knowledge & order"
  },
  {
   "id": "schumpeter",
   "name": "Schumpeter",
   "full": "Joseph A. Schumpeter",
   "b": 1883,
   "d": 1950,
   "lane": "aut",
   "w": 156,
   "de": "Innovation; Konjunktur; Bonner Mentor Löschs",
   "en": "Innovation; cycles; Lösch's Bonn mentor"
  },
  {
   "id": "haberler",
   "name": "Haberler",
   "full": "Gottfried von Haberler",
   "b": 1900,
   "d": 1995,
   "lane": "aut",
   "w": 25,
   "de": "Wiener Kreis; Außenhandel",
   "en": "Vienna circle; international trade"
  },
  {
   "id": "marshall",
   "name": "Marshall",
   "full": "Alfred Marshall",
   "b": 1842,
   "d": 1924,
   "lane": "camb",
   "w": 0,
   "de": "Neoklassik; Cambridge",
   "en": "Neoclassical; Cambridge"
  },
  {
   "id": "pigou",
   "name": "Pigou",
   "full": "Arthur C. Pigou",
   "b": 1877,
   "d": 1959,
   "lane": "camb",
   "w": 0,
   "de": "Wohlfahrtsökonomik",
   "en": "Welfare economics"
  },
  {
   "id": "keynes",
   "name": "Keynes",
   "full": "John Maynard Keynes",
   "b": 1883,
   "d": 1946,
   "lane": "camb",
   "w": 12,
   "de": "Allgemeine Theorie",
   "en": "General Theory"
  },
  {
   "id": "fisher",
   "name": "Fisher",
   "full": "Irving Fisher",
   "b": 1867,
   "d": 1947,
   "lane": "anglo",
   "w": 7,
   "de": "Neoklassik; Geldtheorie",
   "en": "Neoclassical; monetary theory"
  },
  {
   "id": "knight",
   "name": "Knight",
   "full": "Frank H. Knight",
   "b": 1885,
   "d": 1972,
   "lane": "anglo",
   "w": 1,
   "de": "Chicago; Unsicherheit; Weber-Übersetzer",
   "en": "Chicago; uncertainty; Weber's translator"
  },
  {
   "id": "robbins",
   "name": "Robbins",
   "full": "Lionel Robbins",
   "b": 1898,
   "d": 1984,
   "lane": "anglo",
   "w": 0,
   "de": "LSE; holte Hayek nach England",
   "en": "LSE; brought Hayek to England"
  },
  {
   "id": "hicks",
   "name": "Hicks",
   "full": "John R. Hicks",
   "b": 1904,
   "d": 1989,
   "lane": "anglo",
   "w": 0,
   "de": "LSE/Oxford; Value and Capital",
   "en": "LSE/Oxford; Value and Capital"
  },
  {
   "id": "leontief",
   "name": "Leontief",
   "full": "Wassily Leontief",
   "b": 1905,
   "d": 1999,
   "lane": "anglo",
   "w": 20,
   "de": "Input-Output; Ausbildung in Berlin/Kiel",
   "en": "Input–output; trained in Berlin/Kiel"
  },
  {
   "id": "friedman",
   "name": "Friedman",
   "full": "Milton Friedman",
   "b": 1912,
   "d": 2006,
   "lane": "anglo",
   "w": 0,
   "de": "Chicago; Monetarismus",
   "en": "Chicago; monetarism"
  },
  {
   "id": "samuelson",
   "name": "Samuelson",
   "full": "Paul A. Samuelson",
   "b": 1915,
   "d": 2009,
   "lane": "anglo",
   "w": 4,
   "de": "Neoklassische Synthese; Schumpeter-Schüler",
   "en": "Neoclassical synthesis; Schumpeter's student"
  },
  {
   "id": "viner",
   "name": "Viner",
   "full": "Jacob Viner",
   "b": 1892,
   "d": 1970,
   "lane": "anglo",
   "w": 8,
   "de": "Chicago/Princeton; Außenhandelstheorie",
   "en": "Chicago/Princeton; trade theory"
  },
  {
   "id": "wicksell",
   "name": "Wicksell",
   "full": "Knut Wicksell",
   "b": 1851,
   "d": 1926,
   "lane": "stockholm",
   "w": 0,
   "de": "Kumulativer Prozess; Geldtheorie",
   "en": "Cumulative process; monetary theory"
  },
  {
   "id": "cassel",
   "name": "Cassel",
   "full": "Gustav Cassel",
   "b": 1866,
   "d": 1945,
   "lane": "stockholm",
   "w": 0,
   "de": "Preistheorie; Stockholm",
   "en": "Price theory; Stockholm"
  },
  {
   "id": "ohlin",
   "name": "Ohlin",
   "full": "Bertil Ohlin",
   "b": 1899,
   "d": 1979,
   "lane": "stockholm",
   "w": 13,
   "de": "Heckscher-Ohlin; Außenhandel",
   "en": "Heckscher–Ohlin; trade"
  },
  {
   "id": "myrdal",
   "name": "Myrdal",
   "full": "Gunnar Myrdal",
   "b": 1898,
   "d": 1987,
   "lane": "stockholm",
   "w": 0,
   "de": "Stockholmer Schule; Kumulation",
   "en": "Stockholm School; circular causation"
  },
  {
   "id": "veblen",
   "name": "Veblen",
   "full": "Thorstein Veblen",
   "b": 1857,
   "d": 1929,
   "lane": "inst",
   "w": 0,
   "de": "Institutionalismus",
   "en": "Institutionalism"
  },
  {
   "id": "jbclark",
   "name": "Clark, J. B.",
   "full": "John Bates Clark",
   "b": 1847,
   "d": 1938,
   "lane": "inst",
   "w": 0,
   "de": "Grenzproduktivität; Knies-Schüler",
   "en": "Marginal productivity; Knies's student"
  },
  {
   "id": "commons",
   "name": "Commons",
   "full": "John R. Commons",
   "b": 1862,
   "d": 1945,
   "lane": "inst",
   "w": 0,
   "de": "Institutionenökonomik",
   "en": "Institutional economics"
  },
  {
   "id": "mitchell",
   "name": "Mitchell",
   "full": "Wesley C. Mitchell",
   "b": 1874,
   "d": 1948,
   "lane": "inst",
   "w": 0,
   "de": "Konjunkturforschung; NBER",
   "en": "Business-cycle research; NBER"
  },
  {
   "id": "taussig",
   "name": "Taussig",
   "full": "Frank W. Taussig",
   "b": 1859,
   "d": 1940,
   "lane": "inst",
   "w": 24,
   "de": "Harvard; Löschs Gastgeber 1934/35",
   "en": "Harvard; Lösch's host 1934/35"
  },
  {
   "id": "eucken",
   "name": "Eucken",
   "full": "Walter Eucken",
   "b": 1891,
   "d": 1950,
   "lane": "ordo",
   "w": 152,
   "de": "Freiburger Schule; erster Mentor Löschs",
   "en": "Freiburg School; Lösch's first mentor"
  },
  {
   "id": "fboehm",
   "name": "Böhm, Franz",
   "full": "Franz Böhm",
   "b": 1895,
   "d": 1977,
   "lane": "ordo",
   "w": 8,
   "de": "Ordoliberalismus; Wettbewerbsordnung",
   "en": "Ordoliberalism; competitive order"
  },
  {
   "id": "roepke",
   "name": "Röpke",
   "full": "Wilhelm Röpke",
   "b": 1899,
   "d": 1966,
   "lane": "ordo",
   "w": 7,
   "de": "Ordoliberalismus; Sozialökonomie",
   "en": "Ordoliberalism; social economy"
  },
  {
   "id": "ruestow",
   "name": "Rüstow",
   "full": "Alexander Rüstow",
   "b": 1885,
   "d": 1963,
   "lane": "ordo",
   "w": 19,
   "de": "Ordoliberalismus; Soziologie",
   "en": "Ordoliberalism; sociology"
  },
  {
   "id": "thuenen",
   "name": "Thünen",
   "full": "Johann H. von Thünen",
   "b": 1783,
   "d": 1850,
   "lane": "raum",
   "w": 16,
   "de": "Der isolierte Staat; Standortlehre",
   "en": "The Isolated State; location theory"
  },
  {
   "id": "aweber",
   "name": "Weber, Alfred",
   "full": "Alfred Weber",
   "b": 1868,
   "d": 1958,
   "lane": "raum",
   "w": 0,
   "de": "Industriestandortlehre",
   "en": "Theory of industrial location"
  },
  {
   "id": "christaller",
   "name": "Christaller",
   "full": "Walter Christaller",
   "b": 1893,
   "d": 1969,
   "lane": "raum",
   "w": 3,
   "de": "Zentrale Orte",
   "en": "Central place theory"
  },
  {
   "id": "loesch",
   "name": "Lösch",
   "full": "August Lösch",
   "b": 1906,
   "d": 1945,
   "lane": "raum",
   "w": 0,
   "de": "Die räumliche Ordnung der Wirtschaft",
   "en": "The Economics of Location"
  },
  {
   "id": "predoehl",
   "name": "Predöhl",
   "full": "Andreas Predöhl",
   "b": 1893,
   "d": 1974,
   "lane": "raum",
   "w": 76,
   "de": "IfW Kiel; Standorttheorie",
   "en": "IfW Kiel; location theory"
  },
  {
   "id": "palander",
   "name": "Palander",
   "full": "Tord Palander",
   "b": 1902,
   "d": 1972,
   "lane": "raum",
   "w": 27,
   "de": "Standorttheorie; Schweden",
   "en": "Location theory; Sweden"
  },
  {
   "id": "hoover",
   "name": "Hoover",
   "full": "Edgar M. Hoover",
   "b": 1907,
   "d": 1992,
   "lane": "raum",
   "w": 25,
   "de": "Standort- u. Regionalökonomik",
   "en": "Location & regional economics"
  },
  {
   "id": "isard",
   "name": "Isard",
   "full": "Walter Isard",
   "b": 1919,
   "d": 2010,
   "lane": "raum",
   "w": 0,
   "de": "Regional Science",
   "en": "Regional science"
  },
  {
   "id": "stolper",
   "name": "Stolper",
   "full": "Wolfgang F. Stolper",
   "b": 1912,
   "d": 2002,
   "lane": "raum",
   "w": 50,
   "de": "Übersetzer der Räumlichen Ordnung",
   "en": "Translator of Lösch's magnum opus"
  }
 ],
 "edges": [
  {
   "s": "list",
   "t": "roscher",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "stages/national-economy lineage"
    }
   ]
  },
  {
   "s": "list",
   "t": "hildebrand",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "roscher",
   "t": "schmoller",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "older → younger school"
    }
   ]
  },
  {
   "s": "knies",
   "t": "schmoller",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "knies",
   "t": "mweber",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Weber held Knies's Heidelberg chair"
    }
   ]
  },
  {
   "s": "roscher",
   "t": "wagner",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "loose — verify"
    }
   ]
  },
  {
   "s": "roscher",
   "t": "brentano",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "loose — verify"
    }
   ]
  },
  {
   "s": "hildebrand",
   "t": "buecher",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "stages tradition"
    }
   ]
  },
  {
   "s": "schmoller",
   "t": "sombart",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Sombart was Schmoller's protégé"
    }
   ]
  },
  {
   "s": "sombart",
   "t": "mweber",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Archiv co-editors; mutual"
    }
   ]
  },
  {
   "s": "schmoller",
   "t": "spiethoff",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Spiethoff was Schmoller's assistant in Berlin"
    }
   ]
  },
  {
   "s": "schmoller",
   "t": "menger",
   "kind": "methodenstreit",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "the 1883 dispute"
    }
   ]
  },
  {
   "s": "schmoller",
   "t": "commons",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "historical method → US institutionalism"
    }
   ]
  },
  {
   "s": "smith",
   "t": "ricardo",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "smith",
   "t": "list",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "List reacts to Smith"
    }
   ]
  },
  {
   "s": "ricardo",
   "t": "marx",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "ricardo",
   "t": "marshall",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "mill",
   "t": "marshall",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "marx",
   "t": "sombart",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "jevons",
   "t": "menger",
   "kind": "parallel",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "independent co-discovery 1871"
    }
   ]
  },
  {
   "s": "jevons",
   "t": "walras",
   "kind": "parallel",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "independent co-discovery 1871"
    }
   ]
  },
  {
   "s": "menger",
   "t": "walras",
   "kind": "parallel",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "independent co-discovery 1871"
    }
   ]
  },
  {
   "s": "walras",
   "t": "pareto",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Lausanne succession"
    }
   ]
  },
  {
   "s": "jevons",
   "t": "marshall",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "menger",
   "t": "boehm",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "menger",
   "t": "wieser",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "boehm",
   "t": "mises",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Böhm-Bawerk seminar"
    }
   ]
  },
  {
   "s": "boehm",
   "t": "schumpeter",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Böhm-Bawerk seminar"
    }
   ]
  },
  {
   "s": "wieser",
   "t": "hayek",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Hayek's Vienna mentor"
    }
   ]
  },
  {
   "s": "mises",
   "t": "hayek",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Mises Privatseminar"
    }
   ]
  },
  {
   "s": "schumpeter",
   "t": "haberler",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Vienna"
    }
   ]
  },
  {
   "s": "mises",
   "t": "haberler",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Vienna seminar"
    }
   ]
  },
  {
   "s": "marshall",
   "t": "pigou",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Cambridge succession"
    }
   ]
  },
  {
   "s": "marshall",
   "t": "keynes",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Cambridge succession"
    }
   ]
  },
  {
   "s": "mweber",
   "t": "knight",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Knight translated Weber's Economic History"
    }
   ]
  },
  {
   "s": "menger",
   "t": "knight",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Austrian capital theory received at Chicago"
    }
   ]
  },
  {
   "s": "knight",
   "t": "friedman",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Chicago; Knight taught Friedman"
    }
   ]
  },
  {
   "s": "fisher",
   "t": "friedman",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "quantity theory"
    }
   ]
  },
  {
   "s": "jevons",
   "t": "fisher",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "marginalism → US neoclassical"
    }
   ]
  },
  {
   "s": "mises",
   "t": "robbins",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "LSE; Austrian reception in England"
    }
   ]
  },
  {
   "s": "hayek",
   "t": "robbins",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "LSE colleagues"
    }
   ]
  },
  {
   "s": "hayek",
   "t": "hicks",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "LSE"
    }
   ]
  },
  {
   "s": "walras",
   "t": "hicks",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Value and Capital; GE synthesis"
    }
   ]
  },
  {
   "s": "schumpeter",
   "t": "samuelson",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Harvard student"
    }
   ]
  },
  {
   "s": "leontief",
   "t": "samuelson",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Harvard teacher"
    }
   ]
  },
  {
   "s": "keynes",
   "t": "samuelson",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "neoclassical synthesis"
    }
   ]
  },
  {
   "s": "sombart",
   "t": "leontief",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Berlin doctoral milieu — verify advisor"
    }
   ]
  },
  {
   "s": "walras",
   "t": "leontief",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "GE → input–output"
    }
   ]
  },
  {
   "s": "taussig",
   "t": "viner",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Harvard doctoral advisor"
    }
   ]
  },
  {
   "s": "viner",
   "t": "friedman",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Chicago teacher"
    }
   ]
  },
  {
   "s": "haberler",
   "t": "viner",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "interwar trade theory"
    }
   ]
  },
  {
   "s": "walras",
   "t": "wicksell",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "general equilibrium"
    }
   ]
  },
  {
   "s": "boehm",
   "t": "wicksell",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Austrian capital theory"
    }
   ]
  },
  {
   "s": "wicksell",
   "t": "ohlin",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Stockholm school"
    }
   ]
  },
  {
   "s": "wicksell",
   "t": "myrdal",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Stockholm school"
    }
   ]
  },
  {
   "s": "wicksell",
   "t": "cassel",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "cassel",
   "t": "ohlin",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "knies",
   "t": "jbclark",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Clark studied under Knies at Heidelberg"
    }
   ]
  },
  {
   "s": "veblen",
   "t": "mitchell",
   "kind": "strong",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Veblen taught Mitchell"
    }
   ]
  },
  {
   "s": "schumpeter",
   "t": "taussig",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Harvard colleagues"
    }
   ]
  },
  {
   "s": "eucken",
   "t": "fboehm",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "letters/studium.tex fn (Eucken)",
     "note": "Freiburg School"
    }
   ]
  },
  {
   "s": "eucken",
   "t": "roepke",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript: Freiburg/ordo circle",
     "note": ""
    }
   ]
  },
  {
   "s": "eucken",
   "t": "ruestow",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript: ordo circle",
     "note": ""
    }
   ]
  },
  {
   "s": "mises",
   "t": "roepke",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "Mont Pèlerin / liberal revival"
    }
   ]
  },
  {
   "s": "hayek",
   "t": "eucken",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex: Eucken died visiting Hayek, London 1950",
     "note": ""
    }
   ]
  },
  {
   "s": "eucken",
   "t": "loesch",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex (Biogr. Überblick)",
     "note": "first mentor, Tübingen/Freiburg"
    }
   ]
  },
  {
   "s": "spiethoff",
   "t": "loesch",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex",
     "note": "Habilitation Erstgutachter; Privatdozent under him"
    }
   ]
  },
  {
   "s": "schumpeter",
   "t": "loesch",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex",
     "note": "Bonn Vertrauensdozent; doctoral examiner"
    }
   ]
  },
  {
   "s": "taussig",
   "t": "loesch",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex",
     "note": "hosted Lösch at Harvard 1934/35"
    }
   ]
  },
  {
   "s": "thuenen",
   "t": "aweber",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "location theory lineage"
    }
   ]
  },
  {
   "s": "aweber",
   "t": "christaller",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": ""
    }
   ]
  },
  {
   "s": "thuenen",
   "t": "loesch",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript",
     "note": "Lösch builds on Thünen"
    }
   ]
  },
  {
   "s": "aweber",
   "t": "loesch",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript",
     "note": ""
    }
   ]
  },
  {
   "s": "christaller",
   "t": "loesch",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript",
     "note": "central-place theory"
    }
   ]
  },
  {
   "s": "loesch",
   "t": "stolper",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex",
     "note": "Stolper translated the Räumliche Ordnung"
    }
   ]
  },
  {
   "s": "loesch",
   "t": "hoover",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "_personae.tex",
     "note": "Hoover's translation attempt"
    }
   ]
  },
  {
   "s": "loesch",
   "t": "isard",
   "kind": "influence",
   "ev": [
    {
     "t": "ref",
     "cite": "std. HET reference — confirm",
     "note": "regional science"
    }
   ]
  },
  {
   "s": "palander",
   "t": "loesch",
   "kind": "influence",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript",
     "note": "contemporary location theorists"
    }
   ]
  },
  {
   "s": "predoehl",
   "t": "loesch",
   "kind": "strong",
   "ev": [
    {
     "t": "ms",
     "cite": "Bieri2026a",
     "loc": "manuscript",
     "note": "IfW Kiel"
    }
   ]
  }
 ],
 "lanes": [
  {
   "id": "klassik",
   "color": "#6b5b4f",
   "de": "Klassik & Vorläufer",
   "en": "Classical & forerunners"
  },
  {
   "id": "hist",
   "color": "#1B3A6B",
   "de": "Historische Schule",
   "en": "Historical School"
  },
  {
   "id": "aut",
   "color": "#2C6E72",
   "de": "Grenznutzen & Österreichische Schule",
   "en": "Marginalist & Austrian School"
  },
  {
   "id": "camb",
   "color": "#5a6b8c",
   "de": "Neoklassik & Cambridge",
   "en": "Neoclassical & Cambridge"
  },
  {
   "id": "anglo",
   "color": "#4b4e58",
   "de": "Angloamerikanische Moderne",
   "en": "Anglo-American mainstream"
  },
  {
   "id": "stockholm",
   "color": "#4A7C59",
   "de": "Stockholmer Schule",
   "en": "Stockholm School"
  },
  {
   "id": "inst",
   "color": "#6a6fa8",
   "de": "Amerik. Institutionalismus",
   "en": "American Institutionalism"
  },
  {
   "id": "ordo",
   "color": "#A67C2E",
   "de": "Ordoliberalismus / Freiburg",
   "en": "Ordoliberalism / Freiburg"
  },
  {
   "id": "raum",
   "color": "#B5651D",
   "de": "Raumwirtschaft & Standorttheorie",
   "en": "Spatial Economics & Location Theory"
  }
 ],
 "bib": {
  "Bieri2026a": "Bieri (Hg.) 2026, August Lösch: Briefe/Letters, Bd. 53, Marburg: Metropolis"
 }
};
