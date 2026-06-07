# AGW Analytics — Wissenschaftliches Handbuch / Academic Manual

**Ausschuss für die Geschichte der Wirtschaftswissenschaften**  
**Verein für Socialpolitik**  
**2026**

---

## Inhaltsverzeichnis / Table of Contents

1. [Einführung](#einführung)
2. [Methodik und Datengrundlage](#methodik-und-datengrundlage)
3. [Die Analysewerkzeuge](#die-analysewerkzeuge)
4. [Introduction](#introduction)
5. [Methodology and Data](#methodology-and-data)
6. [The Analytical Tools](#the-analytical-tools)
7. [Literaturverzeichnis / References](#literaturverzeichnis--references)
8. [Weiterführende Literatur / Further Reading](#weiterführende-literatur--further-reading)

---

## Einführung

Dieses Handbuch dient als wissenschaftliche Begleitdokumentation zu den AGW Analytics-Werkzeugen. Die Plattform visualisiert und analysiert die intellektuelle Rezeptionsgeschichte innerhalb des Ausschusses für die Geschichte der Wirtschaftswissenschaften (AGW) im Verein für Socialpolitik über einen Zeitraum von 43 Jahren (1980–2023).

Die zugrundeliegenden Daten basieren auf den Konferenzbänden des AGW und wurden durch Text-Mining, Netzwerkanalyse und manuelle Kuration aufbereitet. Die Plattform bietet fünf Hauptperspektiven auf diese Daten: einen geführten **Rundgang**, den **Atlas**, **Analysen**, **Netzwerke** und den **Zeitverlauf**.

| Dimension | Beschreibung | Methode |
|---|---|---|
| Rundgang | Geführte Datenreise | Scrollytelling |
| Atlas | Wer wurde wann wie intensiv diskutiert? | Streudiagramm, Heatmap, Zeitreihe |
| Analysen | Strukturelle Muster im Kanon | Netzwerk, Slope-Charts, Scatter |
| Netzwerke | Relationale Verbindungen | Force-directed Graph, Sankey |
| Zeitverlauf | Thematische Evolution | Streamgraph, PPMI |

---

## Methodik und Datengrundlage

### Korpus und Entitätenerkennung

Der Korpus umfasst die veröffentlichten Bände der AGW-Jahrestagungen von 1980 bis 2023. Mittels Named Entity Recognition (NER) wurden 81 intellektuelle Schlüsselfiguren identifiziert und disambiguiert — etwa die Unterscheidung zwischen Max Weber (Soziologe, *1864) und Alfred Weber (Standorttheoretiker, *1868), oder zwischen den verschiedenen Generationen der Freiburger Schule.

Die Figuren wurden manuell 16 Denkschulen zugeordnet, wobei die Taxonomie der History of Economic Thought Website [2] als Leitfaden diente. Bei Figuren, die mehreren Schulen zugeordnet werden könnten (z.B. Schumpeter: Österreichische Schule und Evolutionsökonomik), wurde die primäre Zuordnung nach dem Schwerpunkt der AGW-Diskussion gewählt.

### Kookkurrenz und PPMI

Die thematische Analyse (Tab *Zeitverlauf* → *Themenanalyse*) basiert auf Positive Pointwise Mutual Information (PPMI). PPMI misst die Assoziationsstärke zwischen einer Figur und einem von 53 identifizierten Themen innerhalb eines Textfensters von ±400 Zeichen:

> **PPMI(x,y) = max(0, log₂ [P(x,y) / (P(x) · P(y))])**

Dieser Ansatz, etabliert in der computerlinguistischen Forschung [1], filtert allgemeine Begriffe heraus und hebt charakteristische, spezifische Assoziationen hervor. Ein hoher PPMI-Wert bedeutet, dass eine Figur und ein Thema signifikant häufiger gemeinsam auftreten als durch Zufall zu erwarten wäre.

**Wichtiger Hinweis:** PPMI bevorzugt seltene Kookkurrenzen — eine Figur mit nur zwei Nennungen, beide neben einem seltenen Thema, erzielt einen hohen Score. Die Fensterzahl (im Hover sichtbar) zeigt die empirische Belegstärke.

### Netzwerkkonstruktion

Die Ego-Netzwerke (Tab *Netzwerke*) kombinieren zwei Kantenarten:

| Kantentyp | Darstellung | Quelle | Bedeutung |
|---|---|---|---|
| Ko-Zitation | Grau, durchgezogen | Konferenzbände | Figuren werden im selben Band signifikant oft diskutiert |
| Stammbaum | Orange, gestrichelt, mit Pfeil | HET Website [2], Standardwerke | Historisch belegte Lehrer-Schüler-Beziehung |

Die Ko-Zitationskanten wurden über einen Schwellenwert gefiltert: nur Figurenpaare, die in mindestens 3 Konferenzbänden gemeinsam auftreten, werden als verbunden dargestellt. Die Stammbaum-Kanten basieren auf der kuratierten Datenbank der HET Website sowie auf Standardwerken der Dogmengeschichte [4] [5].

### Sankey-Flussberechnung

Das Sankey-Diagramm (Tab *Netzwerke* → *Sankey*) modelliert Aufmerksamkeitsflüsse zwischen Denkschulen über fünf Jahrzehnte (1980er, 1990er, 2000er, 2010er, 2020er). Die Flussstärken basieren auf drei kombinierten Signalen:

| Signal | Gewicht | Interpretation |
|---|---|---|
| Aufmerksamkeitsmigration | 50% | Wenn Schule X abnimmt und Y zunimmt, fließt Aufmerksamkeit von X nach Y |
| Ko-Zitationsbrücken | 30% | Schulenübergreifende Ko-Zitationen zeigen intellektuelle Affinität |
| Intellektuelle Stammbäume | 20% | Lehrer-Schüler-Beziehungen über Schulgrenzen hinweg |

---

## Die Analysewerkzeuge

### Startseite (Landing Page)

Die Startseite (`index.html`) wählt bei jedem Aufruf zufällig einen von fünf visuellen Modi als animierten Hintergrund (Hero-Visualisierung). Jeder Modus beleuchtet einen anderen Aspekt des Datensatzes:

- **Animierte Zeitleiste:** Ein horizontales Band (1980–2023), auf dem Konferenzorte und Namen dominierender Figuren einblenden.
- **Namen-Wolke:** Top-40-Figuren schweben mit sanfter Gravitation, skaliert nach Zitationshäufigkeit, farbkodiert nach Schule.
- **Mini-Streamgraph:** Eine kompakte, sich selbst zeichnende Version der Themenfluss-Visualisierung.
- **Zitate-Karussell:** Rotierende Zitate zentraler Figuren (Schumpeter, Hayek, Keynes, Marshall, Menger) gepaart mit einer Sparkline ihres Zitationsverlaufs.
- **Konferenz-Mosaik:** Ein Raster aller 43 Konferenzen, das subtil pulsiert.

### Rundgang (Scrollytelling)

Eine kuratierte Datenreise durch 43 Jahre intellektuelle Geschichte. Dieser Modus ist der Standard-Einstieg in die Analyseseite und verwendet ein Split-Panel-Layout: auf der linken Seite scrollt der Leser durch wissenschaftlich fundierten Text, auf der rechten Seite reagieren synchronisierte Visualisierungen.

Die acht Szenen behandeln:

1. **Überblick** — 43 Konferenzen, 81 Figuren, 199 Verbindungen
2. **Die Klassiker dominieren** — Klassik und Neoklassik in den 1980ern
3. **Das Austrian Revival** — Der Aufstieg der Österreichischen Schule [3]
4. **Schumpeter als Brückenfigur** — 28 Konferenzen, 36 Ko-Zitationen, 5 Stammbaum-Verbindungen
5. **Pluralisierung nach 2000** — Wachsende Diversität der Schulen
6. **Aufsteiger und Vergessene** — Wer gewann, wer verlor an Aufmerksamkeit?
7. **Lehrer und Schüler** — Die Stammbäume der Wiener und Freiburger Schulen
8. **Ausblick** — Die Zukunft der Dogmengeschichte

### Atlas (Rezeptionsatlas)

Der Atlas bietet eine makroskopische Sicht auf die Präsenz von Figuren über die Zeit. Drei Ansichten beleuchten dieselbe Grundfrage aus verschiedenen Perspektiven:

**Ansicht A — Präsenz-Streudiagramm:** Jeder Punkt repräsentiert das Auftreten einer Figur in einem bestimmten Konferenzjahr. Die Punktgröße kodiert die Intensität (Anzahl der Nennungen), die Farbe die Schulzugehörigkeit. Durch Hover erscheint der vollständige Kontext.

**Ansicht B — Epochen-Heatmap:** Aggregiert die Präsenzdaten auf Jahrzehnte-Ebene. Besonders aufschlussreich für die Identifikation von Figuren, die über alle Epochen hinweg stabil diskutiert werden (z.B. Schumpeter: dunkel in allen vier Epochen) im Gegensatz zu solchen, die nur in einer Ära auftreten.

**Ansicht C — Top-Figuren Zeitreihe:** Die am häufigsten zitierten Figuren als Linienchart. Zeigt Aufstieg, Plateau und Rückgang im Diskurs — etwa den Rückgang von Marx nach 1995 oder den stetigen Aufstieg Hayeks nach 2000.

### Analysen (Strukturelle Perspektiven)

Dieser Bereich zerlegt den Korpus in fünf analytische Dimensionen:

**A — Intellektuelle Strömungen:** Gestapelte Flächendiagramme zeigen den Anteil jeder Denkschule am AGW-Diskurs über die Zeit. Hier wird die "Austrian Revival" der späten 1980er und 1990er Jahre sichtbar [3], ebenso wie die wachsende Diversifizierung nach 2000.

**B — Intellektuelle Konstellation:** Ein Kookurrenz-Netzwerk, in dem Figuren, die häufig in denselben Konferenzen zitiert werden, nahe beieinander erscheinen. Durch Hover auf einen Knoten werden alle Ko-Präsenzverbindungen hervorgehoben (Ego-Netzwerk-Dimming).

**C — Aufsteiger & Vergessene:** Bilaterale Balken vergleichen die Zitationshäufigkeit der ersten Hälfte des Korpus (1980–2000) mit der zweiten (2001–2023). Figuren wie Hayek und Eucken zeigen starken Anstieg; Marx und Ricardo zeigen Rückgang.

**D — Der lange Griff:** Ein Streudiagramm, das das Geburtsjahr einer Figur gegen ihren Erstauftritt im AGW plottet. Der "Entdeckungsverzug" reicht von wenigen Jahrzehnten (zeitgenössische Figuren) bis zu über vier Jahrhunderten (Francis Bacon: 439 Jahre).

**E — Säulen & Gäste:** Horizontale Balken, sortiert nach Auftrittshäufigkeit. Trennt den stabilen Kern (≥10 Konferenzen: Schumpeter, Marx, Keynes, Hayek, Smith, Ricardo, Menger, Weber) vom Peripheriekanon.

### Netzwerke (Relationalität)

Drei Unteransichten beleuchten die relationalen Strukturen des intellektuellen Feldes:

**Ego-Netzwerk (Interaktiver Explorer):** Ein Force-directed Graph aller 81 Schlüsselfiguren mit 199 Kanten. Durch Klicken auf einen Knoten wird dessen "Ego-Netzwerk" hervorgehoben — alle direkten Nachbarn bleiben sichtbar, der Rest wird gedimmt. Das Detail-Panel zeigt:

- Name, Schule und Lebensdaten
- Biografische Kurzbeschreibung (aus der HET Website [2])
- Schlüsselwerke
- Aufschlüsselung der Nachbarn nach Ko-Zitation und Stammbaum
- Direkter Link zum HET-Profil

**Stammbaum (HET Lineage):** Eine hierarchische Ansicht der Lehrer-Schüler-Beziehungen, geordnet nach Denkschulen (vertikale Bahnen) und Zeit (horizontale Achse). Zeigt die intellektuellen Genealogien von der Wiener Grenznutzenschule über die Freiburger Ordoliberalen bis zur Harvard-Tradition.

**Sankey (Ideenfluss):** Ein Alluvial-Diagramm, das die Verschiebung von Aufmerksamkeit zwischen 16 Denkschulen über fünf Jahrzehnte modelliert. Durch Klicken auf eine Schule wird deren Pfad durch die Jahrzehnte hervorgehoben. Besonders aufschlussreich: die Persistenz der Historischen Schule, der Aufstieg der Evolutionsökonomik, und die Brückenflüsse zwischen Neoklassik und Österreichischer Schule.

### Zeitverlauf (Thematische Evolution)

**Streamgraph (Themenfluss):** Visualisiert die relative und absolute Präsenz von 16 Denkschulen über alle 43 Konferenzen. Drei Modi stehen zur Verfügung:

| Modus | Darstellung | Besonders geeignet für |
|---|---|---|
| Streamgraph | Organische Fließform | Absolute Volumina, ästhetischer Überblick |
| Gestapelt (100%) | Normierte Flächen | Relative Anteilsverschiebungen |
| Alluvial | Sankey-Fluss | Aufmerksamkeitsmigration zwischen Schulen |

Vier Glättungsstufen (keine, 3-Konf., 5-Konf., 7-Konf.) erlauben die Wahl zwischen Detail und Trend. Durch Klick auf eine Schule in der Legende wird diese hervorgehoben.

**PPMI-Assoziationen (Themenanalyse):** Sechs Unteransichten bieten tiefe Einblicke in den semantischen Kontext:

- **A — Themenmatrix:** Figur × Thema Heatmap mit PPMI-Werten
- **B — Intellektuelles Porträt (Profilrad):** Radiales Diagramm für eine einzelne Figur
- **C — Im Wandel der Jahrzehnte:** Themenverschiebungen einer Figur über vier Dekaden
- **D — Schulbrücken:** Welche Schulen teilen sich ein Thema?
- **E — Intellektuelles Terrain:** PCA-Projektion im 53-dimensionalen Themenraum
- **F — Ideennetz:** Bipartites Netzwerk (Top-30 Figuren × Top-22 Themen)

---

## Introduction

This manual serves as the academic companion documentation for the AGW Analytics tools. The platform visualizes and analyzes the history of intellectual reception within the Committee for the History of Economics (AGW) of the Verein für Socialpolitik over a 43-year period (1980–2023).

The underlying data is based on the published conference proceedings of the AGW, processed through text mining, network analysis, and manual curation. The platform offers five main perspectives on this data: a **Guided Tour**, the **Atlas**, **Analytics**, **Networks**, and the **Timeline**.

---

## Methodology and Data

### Corpus and Entity Recognition

The corpus comprises the published volumes of the AGW annual conferences from 1980 to 2023. Using Named Entity Recognition (NER), 81 key intellectual figures were identified and disambiguated — for example, distinguishing between Max Weber (sociologist, *1864) and Alfred Weber (location theorist, *1868).

Figures were manually assigned to 16 schools of thought, using the taxonomy of the History of Economic Thought Website [2] as a guide. For figures that could belong to multiple schools (e.g., Schumpeter: Austrian School and Evolutionary Economics), the primary assignment was chosen based on the emphasis of AGW discussions.

### Co-occurrence and PPMI

The thematic analysis (Tab *Timeline* → *Topic Analysis*) is based on Positive Pointwise Mutual Information (PPMI), measuring the strength of association between a figure and one of 53 identified topics within a text window of ±400 characters:

> **PPMI(x,y) = max(0, log₂ [P(x,y) / (P(x) · P(y))])**

This approach, established in computational linguistics research [1], filters out generic terms and highlights characteristic, specific associations. A high PPMI value means that a figure and a topic co-occur significantly more often than expected by chance.

### Network Construction

The Ego Networks (Tab *Networks*) combine two types of edges:

| Edge Type | Display | Source | Meaning |
|---|---|---|---|
| Co-citation | Grey, solid | Conference volumes | Figures are significantly often discussed in the same volume |
| Lineage | Orange, dashed, with arrow | HET Website [2], standard works | Historically documented teacher-student relationship |

Co-citation edges were filtered by threshold: only figure pairs appearing together in at least 3 conference volumes are shown as connected. Lineage edges are based on the curated database of the HET Website and standard works in the history of economic thought [4] [5].

### Sankey Flow Computation

The Sankey diagram (Tab *Networks* → *Sankey*) models attention flows between schools of thought over five decades (1980s, 1990s, 2000s, 2010s, 2020s). Flow strengths are based on three combined signals:

| Signal | Weight | Interpretation |
|---|---|---|
| Attention migration | 50% | When School X declines and Y rises, attention flows from X to Y |
| Co-citation bridges | 30% | Cross-school co-citations indicate intellectual affinity |
| Intellectual lineages | 20% | Teacher-student relationships crossing school boundaries |

---

## The Analytical Tools

### Landing Page

The landing page (`index.html`) randomly selects one of five visual modes as an animated hero background on each load. Each mode highlights a different aspect of the dataset:

- **Animated Timeline:** A horizontal ribbon (1980–2023) where conference markers and dominant figure names fade in at their peak decades.
- **Name Cloud:** The top 40 figures float with gentle gravity, sized by citation frequency, color-coded by school.
- **Mini Streamgraph:** A compact, auto-drawing version of the topic flow visualization.
- **Quote Carousel:** Rotating quotes from central figures (Schumpeter, Hayek, Keynes, Marshall, Menger) paired with a sparkline of their citation trajectory.
- **Conference Mosaic:** A subtly pulsing grid of all 43 conferences showing year and location.

### Guided Tour (Scrollytelling)

A curated data journey through 43 years of intellectual history. This mode serves as the default entry point to the analytics page and uses a split-panel layout: on the left side, the reader scrolls through academically grounded text, while synchronized visualizations respond on the right side.

The eight scenes cover:

1. **Overview** — 43 conferences, 81 figures, 199 connections
2. **The Classics Dominate** — Classical and Neoclassical dominance in the 1980s
3. **The Austrian Revival** — The rise of the Austrian School [3]
4. **Schumpeter as Bridge Figure** — 28 conferences, 36 co-citations, 5 lineage connections
5. **Pluralization after 2000** — Growing diversity of schools
6. **Risers and the Forgotten** — Who gained, who lost attention?
7. **Teachers and Students** — The lineages of the Viennese and Freiburg schools
8. **Outlook** — The future of Dogmengeschichte

### Atlas (Reception Atlas)

The Atlas provides a macroscopic view of the presence of figures over time through three complementary views: the Presence Scatter (individual data points per figure per year), the Era Heatmap (decadal aggregation revealing structural persistence), and the Top Figures Timeline (line chart showing rise and decline of the most-cited figures).

### Networks (Relationality)

Three sub-views illuminate the relational structures of the intellectual field:

**Ego Network (Interactive Explorer):** A force-directed graph of all 81 key figures with 199 edges. Clicking a node highlights its ego network — all direct neighbors remain visible while the rest fades. The detail panel shows biographical data from the HET Website [2], key works, and a breakdown of neighbors by co-citation and lineage.

**Lineage (HET Family Tree):** A hierarchical view of teacher-student relationships, ordered by schools of thought (vertical lanes) and time (horizontal axis). Shows the intellectual genealogies from the Viennese marginalist school through the Freiburg ordoliberals to the Harvard tradition.

**Sankey (Idea Flow):** An alluvial diagram modeling the shift of attention between 16 schools of thought over five decades. Click a school to highlight its path through the decades. Particularly revealing: the persistence of the Historical School, the rise of Evolutionary Economics, and the bridge flows between Neoclassical and Austrian schools.

---

## Literaturverzeichnis / References

[1] Jurafsky, D., & Martin, J. H. (2000). *Speech and Language Processing*. Prentice Hall.

[2] Fonseca, G. L., & Ussher, L. (Eds.). *The History of Economic Thought Website*. https://www.hetwebsite.net/het/

[3] Vaughn, K. I. (1994). *Austrian Economics in America: The Migration of a Tradition*. Cambridge University Press.

[4] Schumpeter, J. A. (1954). *History of Economic Analysis*. Oxford University Press.

[5] Blaug, M. (1997). *Economic Theory in Retrospect* (5th ed.). Cambridge University Press.

---

## Weiterführende Literatur / Further Reading

The following works provide essential context for understanding the intellectual traditions analyzed in this platform:

**Dogmengeschichte / History of Economic Thought:**

- Kurz, H. D. (2013). *Geschichte des ökonomischen Denkens*. C.H. Beck.
- Tribe, K. (1995). *Strategies of Economic Order: German Economic Discourse, 1750–1950*. Cambridge University Press.
- Hagemann, H. (Ed.). (2010). *Studien zur Entwicklung der ökonomischen Theorie* (Schriften des Vereins für Socialpolitik, Bd. 115). Duncker & Humblot.
- Backhouse, R. E. (2002). *The Penguin History of Economics*. Penguin Books.
- Sandelin, B., Trautwein, H.-M., & Wundrak, R. (2014). *A Short History of Economic Thought* (3rd ed.). Routledge.

**Netzwerkanalyse und Digital Humanities / Network Analysis and Digital Humanities:**

- Borgatti, S. P., Everett, M. G., & Johnson, J. C. (2018). *Analyzing Social Networks* (2nd ed.). SAGE.
- Moretti, F. (2013). *Distant Reading*. Verso.
- Jockers, M. L. (2013). *Macroanalysis: Digital Methods and Literary History*. University of Illinois Press.

**Österreichische Schule und Ordoliberalismus / Austrian School and Ordoliberalism:**

- Caldwell, B. (2004). *Hayek's Challenge: An Intellectual Biography of F. A. Hayek*. University of Chicago Press.
- Goldschmidt, N. (2005). *Wirtschaft, Politik und Freiheit: Freiburger Wirtschaftswissenschaftler und der Widerstand*. Mohr Siebeck.
- Kolev, S. (2017). *Neoliberale Staatsverständnisse im Vergleich*. De Gruyter Oldenbourg.

**Schumpeter und Evolutionsökonomik / Schumpeter and Evolutionary Economics:**

- McCraw, T. K. (2007). *Prophet of Innovation: Joseph Schumpeter and Creative Destruction*. Harvard University Press.
- Witt, U. (2008). "What is specific about evolutionary economics?" *Journal of Evolutionary Economics*, 18(5), 547–575.
- Kurz, H. D. (2012). "Schumpeter's new combinations." *Journal of Evolutionary Economics*, 22(5), 871–899.

**Visualisierung und Wissenschaftskommunikation / Visualization and Science Communication:**

- Tufte, E. R. (2001). *The Visual Display of Quantitative Information* (2nd ed.). Graphics Press.
- Segel, E., & Heer, J. (2010). "Narrative Visualization: Telling Stories with Data." *IEEE Transactions on Visualization and Computer Graphics*, 16(6), 1139–1148.
- Munzner, T. (2014). *Visualization Analysis and Design*. CRC Press.
