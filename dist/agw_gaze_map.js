// agw_gaze_map.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var CONFS = [{ "year": 1980, "number": 1, "theme": "Klassische National\xF6konomie", "location": "Gie\xDFen" }, { "year": 1981, "number": 2, "theme": "Merkantilismus und Kameralismus", "location": "Salzburg" }, { "year": 1982, "number": 3, "theme": "Theoriegeschichte - wozu?", "location": "Basel" }, { "year": 1983, "number": 4, "theme": "Marx, Keynes, Schumpeter", "location": "G\xF6ttingen" }, { "year": 1984, "number": 5, "theme": "Deutsche National\xF6konomie Ende des 18. Jh.", "location": "Salzburg" }, { "year": 1985, "number": 6, "theme": "Entwicklungen der deutschsprachigen National\xF6konomie im 19. Jh.", "location": "M\xFCnster" }, { "year": 1986, "number": 7, "theme": "Allgemeine Gleichgewichtsanalyse", "location": "Stuttgart" }, { "year": 1987, "number": 8, "theme": "Konjunkturtheorie im ausgehenden 19. Jahrhundert", "location": "W\xFCrzburg" }, { "year": 1988, "number": 9, "theme": "Deutschsprachige Wirtschafts-, Konjunktur- und Geldtheorie", "location": "Berlin" }, { "year": 1989, "number": 10, "theme": "Friedrich List; Carl Menger; Lorenz von Stein", "location": "T\xFCbingen" }, { "year": 1990, "number": 11, "theme": "Wirtschaft und Wirtschaftswissenschaften in der Belletristik", "location": "Frankfurt am Main" }, { "year": 1991, "number": 12, "theme": "Osteurop\xE4ische Dogmengeschichte", "location": "Ittingen" }, { "year": 1992, "number": 13, "theme": "Deutsche Finanzwissenschaft zwischen 1918 und 1939", "location": "Augsburg" }, { "year": 1993, "number": 14, "theme": "Johann Heinrich von Th\xFCnen als Wirtschaftstheoretiker", "location": "Tellow" }, { "year": 1994, "number": 15, "theme": "Revolution und Evolution in der Wirtschaftstheorie", "location": "Weimar" }, { "year": 1995, "number": 16, "theme": "Umsetzung wirtschaftspolitischer Grundkonzeptionen I", "location": "Salzburg" }, { "year": 1996, "number": 17, "theme": "Umsetzung wirtschaftspolitischer Grundkonzeptionen II", "location": "Maastricht" }, { "year": 1997, "number": 18, "theme": "Knut Wicksell", "location": "Stuttgart-Hohenheim" }, { "year": 1998, "number": 19, "theme": "John Stuart Mill", "location": "W\xFCrzburg" }, { "year": 1999, "number": 20, "theme": "Die \xC4ltere Historische Schule", "location": "Ulm" }, { "year": 2e3, "number": 21, "theme": "Ideen, Methoden und Entwicklungen", "location": "Wien" }, { "year": 2001, "number": 22, "theme": "Deutschsprachige Wirtschaftswissenschaft nach 1945 I", "location": "Hamburg" }, { "year": 2002, "number": 23, "theme": "Deutschsprachige Wirtschaftswissenschaft nach 1945 II", "location": "Obermayerhofen" }, { "year": 2003, "number": 24, "theme": "\xD6konomie und Religion", "location": "Oldenburg" }, { "year": 2004, "number": 25, "theme": "Wirtschaftswissenschaft und Technik", "location": "Bonn" }, { "year": 2005, "number": 26, "theme": "German\u2013American Economic Thought", "location": "Berlin" }, { "year": 2006, "number": 27, "theme": "Wissen / The Knowledge Economy", "location": "Graz" }, { "year": 2007, "number": 28, "theme": "Wechselseitige Einfl\xFCsse", "location": "L\xFCdinghausen" }, { "year": 2008, "number": 29, "theme": "Einfluss deutschsprachigen Denkens in Japan", "location": "Berlin" }, { "year": 2009, "number": 30, "theme": "Geschichte der Entwicklungstheorien", "location": "Wien" }, { "year": 2010, "number": 31, "theme": "\xD6konomik zwischen Natur- und Geisteswissenschaften", "location": "Stuttgart-Hohenheim" }, { "year": 2011, "number": 32, "theme": "Entwicklung der Raumwirtschaftslehre", "location": "Freiburg i. Br." }, { "year": 2012, "number": 33, "theme": "Zeit um den Ersten Weltkrieg", "location": "Marbach" }, { "year": 2013, "number": 34, "theme": "Marx und Engels \u2014 Neue Perspektiven", "location": "Berlin" }, { "year": 2014, "number": 35, "theme": "Macht oder \xF6konomisches Gesetz?", "location": "Wien" }, { "year": 2015, "number": 36, "theme": "Kontinuit\xE4t und Wandel in der Institutionen\xF6konomie", "location": "Erfurt" }, { "year": 2016, "number": 37, "theme": "Stagnations- und Deflationstheorien", "location": "Karlsruhe" }, { "year": 2017, "number": 38, "theme": "Einkommens- und Verm\xF6gensverteilung", "location": "Siegen" }, { "year": 2018, "number": 39, "theme": "Kameralismus und Merkantilismus", "location": "Darmstadt" }, { "year": 2019, "number": 40, "theme": "\xD6konomie und Evolution", "location": "Hamburg" }, { "year": 2021, "number": 41, "theme": "Entwicklung der Konjunkturforschung", "location": "Online" }, { "year": 2022, "number": 42, "theme": "Geschichte des Vereins f\xFCr Socialpolitik", "location": "Jena" }, { "year": 2023, "number": 43, "theme": "Adam Smith@300", "location": "Edinburgh" }];
var FIGS = [{ "n": "Francis Bacon", "b": 1561, "d": 1626, "s": "Philosophy", "y": { "2000": 8, "2004": 5, "2005": 5, "2016": 5, "2018": 5 }, "df": 5, "ts": 28 }, { "n": "Thomas Hobbes", "b": 1588, "d": 1679, "s": "Philosophy", "y": { "1998": 9, "2000": 5, "2014": 5, "2018": 5 }, "df": 4, "ts": 24 }, { "n": "John Locke", "b": 1632, "d": 1704, "s": "Classical", "y": { "1995": 3, "1999": 3, "2000": 10, "2004": 3, "2005": 5, "2007": 10, "2008": 5, "2011": 8, "2014": 3, "2018": 15 }, "df": 10, "ts": 65 }, { "n": "Richard Cantillon", "b": 1680, "d": 1734, "s": "Classical", "y": { "2001": 5, "2008": 3, "2018": 5 }, "df": 3, "ts": 13 }, { "n": "Daniel Bernoulli", "b": 1700, "d": 1782, "s": "Mathematical Economics", "y": { "1999": 8, "2001": 5, "2005": 5, "2007": 23 }, "df": 4, "ts": 41 }, { "n": "David Hume", "b": 1711, "d": 1776, "s": "Classical", "y": { "1997": 5, "1998": 3, "2000": 15, "2001": 3, "2003": 3, "2005": 5, "2018": 28, "2022": 25 }, "df": 8, "ts": 87 }, { "n": "Adam Smith", "b": 1723, "d": 1790, "s": "Classical", "y": { "1980": 5, "1985": 9, "1989": 3, "1995": 39, "1998": 21, "1999": 17, "2000": 40, "2002": 5, "2003": 10, "2004": 3, "2005": 25, "2008": 13, "2012": 3, "2013": 3, "2014": 6, "2016": 11, "2018": 3, "2019": 5, "2022": 100, "2023": 5 }, "df": 20, "ts": 326 }, { "n": "Adam Ferguson", "b": 1723, "d": 1816, "s": "Classical", "y": { "1997": 5, "2000": 5, "2001": 5, "2014": 5, "2022": 5 }, "df": 5, "ts": 25 }, { "n": "Immanuel Kant", "b": 1724, "d": 1804, "s": "Philosophy", "y": { "2003": 3, "2005": 8, "2016": 16, "2022": 10 }, "df": 4, "ts": 37 }, { "n": "Georg Friedrich von Sartorius", "b": 1765, "d": 1828, "s": "Classical", "y": { "1985": 15, "1999": 6, "2003": 10, "2005": 8 }, "df": 4, "ts": 39 }, { "n": "Wilhelm von Humboldt", "b": 1767, "d": 1835, "s": "Philosophy", "y": { "2005": 8, "2009": 3, "2016": 8 }, "df": 3, "ts": 19 }, { "n": "Georg Wilhelm Friedrich Hegel", "b": 1770, "d": 1831, "s": "Philosophy", "y": { "2005": 5, "2009": 5, "2013": 5, "2022": 15 }, "df": 4, "ts": 30 }, { "n": "David Ricardo", "b": 1772, "d": 1823, "s": "Classical", "y": { "1980": 5, "1985": 24, "1988": 3, "1993": 10, "1995": 3, "1998": 10, "2002": 5, "2007": 31, "2008": 8, "2014": 28, "2016": 5, "2017": 5, "2022": 15, "2023": 3 }, "df": 14, "ts": 155 }, { "n": "Robert Torrens", "b": 1780, "d": 1864, "s": "Classical", "y": { "1999": 3, "2003": 5, "2007": 5 }, "df": 3, "ts": 13 }, { "n": "Johann Heinrich von Th\xFCnen", "b": 1783, "d": 1850, "s": "Raumwirtschaftslehre", "y": { "1985": 3, "1987": 3, "1993": 6, "2002": 3, "2005": 5, "2008": 24, "2014": 3 }, "df": 7, "ts": 47 }, { "n": "Friedrich List", "b": 1789, "d": 1846, "s": "National Economy", "y": { "1999": 3, "2001": 8, "2002": 10, "2008": 5, "2013": 8, "2018": 5 }, "df": 6, "ts": 39 }, { "n": "Charles Babbage", "b": 1791, "d": 1871, "s": "Mathematical Economics", "y": { "1998": 8, "2002": 10, "2004": 5, "2005": 8 }, "df": 4, "ts": 31 }, { "n": "Karl Heinrich Rau", "b": 1792, "d": 1870, "s": "Historical School", "y": { "1999": 5, "2005": 5, "2010": 5, "2011": 5, "2013": 5 }, "df": 5, "ts": 25 }, { "n": "Friedrich Benedict Wilhelm von Hermann", "b": 1795, "d": 1868, "s": "Classical", "y": { "1985": 9, "1992": 9, "1993": 30, "1997": 8, "1998": 5, "1999": 9, "2001": 3, "2004": 6, "2008": 8, "2009": 12, "2011": 5, "2015": 5, "2016": 3, "2019": 3 }, "df": 14, "ts": 115 }, { "n": "John Rae", "b": 1796, "d": 1872, "s": "Classical", "y": { "1997": 5, "2005": 5, "2022": 5 }, "df": 3, "ts": 15 }, { "n": "John Stuart Mill", "b": 1806, "d": 1873, "s": "Classical", "y": { "1980": 5, "1985": 18, "1986": 3, "1988": 3, "1989": 5, "1995": 6, "1998": 543, "1999": 5, "2002": 10, "2005": 5, "2008": 5, "2013": 8, "2016": 26, "2019": 5, "2023": 16 }, "df": 15, "ts": 663 }, { "n": "Bruno Hildebrand", "b": 1812, "d": 1878, "s": "Historical School", "y": { "1998": 8, "1999": 102, "2001": 8, "2003": 15, "2005": 5, "2010": 18, "2011": 8, "2013": 5, "2014": 3 }, "df": 9, "ts": 172 }, { "n": "Lorenz von Stein", "b": 1815, "d": 1890, "s": "Historical School", "y": { "1985": 9, "1992": 6, "1999": 3, "2003": 8, "2009": 3, "2013": 11 }, "df": 6, "ts": 40 }, { "n": "Wilhelm Georg Friedrich Roscher", "b": 1817, "d": 1894, "s": "Historical School", "y": { "1982": 9, "1985": 9, "1993": 11, "1995": 21, "1998": 10, "1999": 35, "2001": 22, "2002": 5, "2003": 5, "2005": 10, "2008": 11, "2010": 20, "2011": 5, "2022": 3 }, "df": 14, "ts": 176 }, { "n": "Karl Marx", "b": 1818, "d": 1883, "s": "Marxist", "y": { "1980": 5, "1993": 6, "1998": 10, "1999": 8, "2001": 8, "2002": 43, "2003": 35, "2005": 5, "2013": 29, "2014": 11, "2015": 5, "2016": 18, "2019": 10, "2022": 13, "2023": 3 }, "df": 15, "ts": 209 }, { "n": "Friedrich Engels", "b": 1820, "d": 1895, "s": "Marxist", "y": { "1990": 3, "1999": 17, "2003": 5, "2004": 3, "2013": 5, "2021": 8, "2022": 8 }, "df": 7, "ts": 49 }, { "n": "John Elliott Cairnes", "b": 1823, "d": 1875, "s": "Classical", "y": { "1998": 5, "2001": 5, "2002": 5 }, "df": 3, "ts": 15 }, { "n": "Walter Bagehot", "b": 1826, "d": 1877, "s": "Classical", "y": { "1986": 3, "1998": 13, "2001": 5, "2003": 5, "2022": 5 }, "df": 5, "ts": 31 }, { "n": "Hermann Roesler", "b": 1834, "d": 1894, "s": "Historical School", "y": { "1999": 6, "2003": 5, "2018": 5 }, "df": 3, "ts": 16 }, { "n": "William Stanley Jevons", "b": 1835, "d": 1882, "s": "Neoclassical", "y": { "1989": 15, "1990": 3, "1994": 3, "1997": 10, "1998": 11, "1999": 6, "2007": 3, "2008": 5, "2011": 11, "2017": 13 }, "df": 10, "ts": 80 }, { "n": "Adolph Wagner", "b": 1835, "d": 1917, "s": "Historical School", "y": { "1985": 3, "1992": 45, "1998": 6, "1999": 14, "2005": 5, "2009": 3, "2016": 12 }, "df": 7, "ts": 88 }, { "n": "Gustav von Schmoller", "b": 1838, "d": 1917, "s": "Historical School", "y": { "1985": 18, "1992": 6, "2001": 17, "2007": 13, "2008": 11, "2009": 8, "2011": 5, "2016": 8, "2018": 5, "2021": 12, "2023": 21 }, "df": 11, "ts": 124 }, { "n": "Carl Menger", "b": 1840, "d": 1921, "s": "Austrian School", "y": { "1995": 3, "1998": 14, "1999": 20, "2001": 6, "2002": 5, "2003": 8, "2004": 3, "2006": 12, "2007": 8, "2011": 14, "2013": 5, "2015": 23, "2016": 5, "2019": 6 }, "df": 14, "ts": 132 }, { "n": "Gustav Cohn", "b": 1840, "d": 1919, "s": "Historical School", "y": { "1992": 6, "2004": 8, "2009": 5 }, "df": 3, "ts": 19 }, { "n": "Alfred Marshall", "b": 1842, "d": 1924, "s": "Neoclassical", "y": { "1980": 5, "1983": 3, "1989": 5, "1993": 3, "1994": 9, "1995": 3, "1998": 5, "1999": 12, "2002": 23, "2003": 10, "2005": 5, "2008": 3, "2010": 19, "2011": 5, "2012": 8, "2013": 5, "2015": 5, "2019": 23, "2022": 3 }, "df": 19, "ts": 154 }, { "n": "Georg Friedrich Knapp", "b": 1842, "d": 1926, "s": "Historical School", "y": { "1993": 3, "1999": 8, "2004": 6, "2019": 39, "2023": 5 }, "df": 5, "ts": 61 }, { "n": "Lujo Brentano", "b": 1844, "d": 1931, "s": "Historical School", "y": { "1994": 3, "2000": 13, "2003": 5, "2009": 8, "2012": 5, "2018": 5, "2019": 8, "2021": 18, "2023": 3 }, "df": 9, "ts": 68 }, { "n": "Francis Ysidro Edgeworth", "b": 1845, "d": 1926, "s": "Neoclassical", "y": { "1985": 6, "1992": 9, "1998": 51, "2002": 5, "2003": 13, "2010": 10 }, "df": 6, "ts": 94 }, { "n": "Karl B\xFCcher", "b": 1847, "d": 1930, "s": "Historical School", "y": { "2002": 5, "2004": 8, "2006": 5, "2008": 5, "2011": 8, "2021": 13 }, "df": 6, "ts": 44 }, { "n": "Wilhelm Hasbach", "b": 1849, "d": 1920, "s": "Historical School", "y": { "2001": 8, "2003": 8, "2022": 5 }, "df": 3, "ts": 21 }, { "n": "Knut Wicksell", "b": 1851, "d": 1926, "s": "Neoclassical", "y": { "1992": 21, "1993": 8, "1997": 58, "1999": 6, "2002": 40, "2003": 15, "2004": 3, "2008": 3, "2010": 16, "2011": 8, "2015": 10, "2017": 3, "2019": 27 }, "df": 13, "ts": 218 }, { "n": "Eugen von B\xF6hm-Bawerk", "b": 1851, "d": 1914, "s": "Austrian School", "y": { "1996": 5, "1997": 5, "1998": 8, "1999": 10, "2000": 5, "2005": 8, "2007": 8, "2009": 16, "2015": 55, "2019": 8, "2021": 5, "2022": 5 }, "df": 12, "ts": 138 }, { "n": "Friedrich von Wieser", "b": 1851, "d": 1926, "s": "Austrian School", "y": { "1985": 12, "1992": 9, "1993": 3, "1995": 9, "1999": 14, "2009": 6 }, "df": 6, "ts": 53 }, { "n": "Richard Ehrenberg", "b": 1857, "d": 1921, "s": "Historical School", "y": { "2000": 3, "2004": 37, "2009": 3, "2018": 5 }, "df": 4, "ts": 48 }, { "n": "Eugen von Philippovich", "b": 1858, "d": 1917, "s": "Austrian School", "y": { "1995": 3, "1996": 5, "2009": 3 }, "df": 3, "ts": 11 }, { "n": "Edwin Cannan", "b": 1861, "d": 1935, "s": "Classical", "y": { "1997": 5, "1998": 11, "2003": 10, "2007": 5, "2015": 8 }, "df": 5, "ts": 39 }, { "n": "Werner Sombart", "b": 1863, "d": 1941, "s": "Historical School", "y": { "1992": 3, "2000": 18, "2001": 6, "2002": 9, "2003": 3, "2004": 3, "2005": 3, "2006": 5, "2008": 13, "2009": 8, "2010": 6, "2011": 6, "2016": 3, "2021": 15, "2022": 6 }, "df": 15, "ts": 107 }, { "n": "Heinrich Herkner", "b": 1863, "d": 1932, "s": "Historical School", "y": { "1992": 9, "2009": 8, "2021": 22, "2023": 18 }, "df": 4, "ts": 57 }, { "n": "Max Weber", "b": 1864, "d": 1920, "s": "Historical School", "y": { "1987": 3, "1994": 21, "1999": 6, "2000": 46, "2003": 11, "2004": 3, "2005": 3, "2006": 3, "2008": 16, "2009": 6, "2011": 6, "2012": 5, "2014": 3, "2015": 3, "2021": 6, "2022": 3, "2023": 3 }, "df": 17, "ts": 147 }, { "n": "Karl Diehl", "b": 1864, "d": 1943, "s": "Historical School", "y": { "1992": 3, "1999": 5, "2001": 3, "2004": 16, "2009": 8, "2010": 3, "2011": 24, "2019": 10 }, "df": 8, "ts": 72 }, { "n": "Franz Oppenheimer", "b": 1864, "d": 1943, "s": "Historical School", "y": { "2001": 5, "2009": 3, "2015": 5 }, "df": 3, "ts": 13 }, { "n": "Karl Gustav Cassel", "b": 1866, "d": 1945, "s": "Neoclassical", "y": { "1992": 30, "1993": 8, "1997": 13, "2002": 8, "2003": 26, "2008": 5, "2009": 5, "2010": 5, "2011": 8, "2013": 8, "2015": 5, "2019": 10, "2023": 5 }, "df": 13, "ts": 136 }, { "n": "Ladislaus Josephovich von Bortkiewicz", "b": 1868, "d": 1931, "s": "Mathematical Economics", "y": { "1994": 6, "1997": 3, "2002": 3, "2008": 3, "2009": 10, "2019": 5 }, "df": 6, "ts": 30 }, { "n": "Rosa Luxemburg", "b": 1871, "d": 1919, "s": "Marxist", "y": { "2008": 5, "2013": 3, "2023": 10 }, "df": 3, "ts": 18 }, { "n": "Moritz Julius Bonn", "b": 1873, "d": 1965, "s": "Historical School", "y": { "1984": 3, "2004": 3, "2019": 10, "2021": 5 }, "df": 4, "ts": 21 }, { "n": "Arthur Cecil Pigou", "b": 1877, "d": 1959, "s": "Neoclassical", "y": { "1992": 15, "1994": 3, "1995": 3, "1998": 23, "2002": 3, "2003": 8, "2011": 3, "2013": 8, "2017": 8, "2019": 8 }, "df": 10, "ts": 82 }, { "n": "Karl Pribram", "b": 1877, "d": 1973, "s": "Austrian School", "y": { "2000": 11, "2001": 11, "2003": 5, "2009": 8, "2011": 5, "2018": 3, "2023": 13 }, "df": 7, "ts": 56 }, { "n": "Rudolf Hilferding", "b": 1877, "d": 1941, "s": "Marxist", "y": { "2009": 10, "2013": 3, "2019": 27, "2022": 8, "2023": 10 }, "df": 5, "ts": 58 }, { "n": "Hans Mayer", "b": 1879, "d": 1955, "s": "Austrian School", "y": { "1985": 3, "1992": 9, "2000": 11, "2008": 3, "2009": 24, "2011": 9, "2013": 3 }, "df": 7, "ts": 62 }, { "n": "Ralph George Hawtrey", "b": 1879, "d": 1975, "s": "Keynesian", "y": { "1997": 14, "2007": 8, "2017": 5, "2019": 8 }, "df": 4, "ts": 35 }, { "n": "Eli Filip Heckscher", "b": 1879, "d": 1952, "s": "Neoclassical", "y": { "1985": 3, "2003": 5, "2012": 13, "2018": 13 }, "df": 4, "ts": 34 }, { "n": "Ludwig von Mises", "b": 1881, "d": 1973, "s": "Austrian School", "y": { "1997": 5, "1998": 11, "1999": 8, "2000": 5, "2007": 14, "2009": 9, "2011": 9, "2014": 3, "2019": 19, "2023": 13 }, "df": 10, "ts": 96 }, { "n": "Otto Bauer", "b": 1881, "d": 1938, "s": "Marxist", "y": { "2001": 16, "2007": 8, "2009": 13, "2013": 3, "2019": 5, "2023": 35 }, "df": 6, "ts": 80 }, { "n": "Frederick Lavington", "b": 1881, "d": 1927, "s": "Keynesian", "y": { "1998": 5, "2013": 5, "2019": 16 }, "df": 3, "ts": 26 }, { "n": "Joseph Alois Schumpeter", "b": 1883, "d": 1950, "s": "Evolutionary", "y": { "1982": 3, "1983": 6, "1985": 21, "1989": 5, "1992": 21, "1993": 9, "1996": 5, "1997": 8, "1998": 8, "1999": 8, "2001": 12, "2002": 5, "2003": 25, "2004": 3, "2005": 43, "2006": 3, "2007": 13, "2008": 10, "2009": 15, "2011": 24, "2012": 8, "2014": 15, "2015": 15, "2016": 91, "2017": 36, "2018": 3, "2019": 35, "2021": 3, "2022": 41, "2023": 38 }, "df": 30, "ts": 532 }, { "n": "John Maynard Keynes", "b": 1883, "d": 1946, "s": "Keynesian", "y": { "1983": 36, "1994": 9, "1996": 8, "1997": 11, "1998": 16, "1999": 11, "2000": 10, "2003": 5, "2004": 27, "2005": 5, "2007": 27, "2014": 9, "2015": 5, "2016": 5, "2017": 72, "2018": 10, "2019": 83, "2023": 11 }, "df": 18, "ts": 360 }, { "n": "Alfred Amonn", "b": 1883, "d": 1962, "s": "Austrian School", "y": { "1992": 27, "2009": 16, "2011": 8, "2013": 5, "2017": 5 }, "df": 5, "ts": 61 }, { "n": "Frank Hyneman Knight", "b": 1885, "d": 1972, "s": "Neoclassical", "y": { "1997": 5, "1998": 5, "1999": 8, "2004": 6, "2005": 5, "2012": 5, "2015": 5 }, "df": 7, "ts": 39 }, { "n": "Franz Boese", "b": 1885, "d": 1943, "s": "Historical School", "y": { "2006": 8, "2009": 5, "2021": 53 }, "df": 3, "ts": 66 }, { "n": "Alvin Harvey Hansen", "b": 1887, "d": 1975, "s": "Keynesian", "y": { "2004": 8, "2013": 5, "2014": 3, "2016": 5, "2017": 38, "2019": 3, "2021": 5, "2022": 8 }, "df": 8, "ts": 75 }, { "n": "Friedrich B\xFClow", "b": 1888, "d": 1962, "s": "Historical School", "y": { "2003": 13, "2008": 29, "2021": 5 }, "df": 3, "ts": 47 }, { "n": "Gerhard Albrecht", "b": 1889, "d": 1969, "s": "Historical School", "y": { "2008": 3, "2009": 5, "2021": 15 }, "df": 3, "ts": 23 }, { "n": "Martin Heidegger", "b": 1889, "d": 1976, "s": "Philosophy", "y": { "2002": 3, "2005": 8, "2023": 8 }, "df": 3, "ts": 19 }, { "n": "Walter Eucken", "b": 1891, "d": 1950, "s": "Ordoliberalismus", "y": { "2003": 10, "2004": 73, "2007": 5, "2008": 5, "2009": 5, "2010": 78, "2011": 10, "2015": 10, "2016": 13, "2019": 51, "2021": 10, "2023": 58 }, "df": 12, "ts": 328 }, { "n": "Edgar Salin", "b": 1892, "d": 1974, "s": "Historical School", "y": { "1992": 3, "1999": 5, "2001": 16, "2003": 10, "2005": 45, "2006": 5, "2008": 11, "2017": 3, "2019": 3, "2021": 3 }, "df": 10, "ts": 104 }, { "n": "Adolph Lowe", "b": 1893, "d": 1995, "s": "Institutional", "y": { "1994": 5, "1998": 5, "2004": 3, "2010": 16, "2011": 3, "2019": 10 }, "df": 6, "ts": 42 }, { "n": "Andreas Pred\xF6hl", "b": 1893, "d": 1974, "s": "Raumwirtschaftslehre", "y": { "1987": 3, "2008": 51, "2019": 3 }, "df": 3, "ts": 57 }, { "n": "Allan George Barnard Fisher", "b": 1895, "d": 1976, "s": "Development Economics", "y": { "1993": 8, "1997": 19, "2002": 5, "2011": 8, "2013": 8, "2015": 13, "2016": 27, "2019": 24 }, "df": 8, "ts": 112 }, { "n": "Franz B\xF6hm", "b": 1895, "d": 1977, "s": "Ordoliberalismus", "y": { "1994": 5, "2000": 5, "2004": 11, "2008": 8, "2013": 5, "2016": 8, "2023": 8 }, "df": 7, "ts": 50 }, { "n": "Hans Philipp Neisser", "b": 1895, "d": 1975, "s": "Austrian School", "y": { "1992": 78, "2002": 16, "2003": 9, "2005": 16, "2011": 3, "2019": 96 }, "df": 6, "ts": 218 }, { "n": "Ragnar Anton Kittil Frisch", "b": 1895, "d": 1973, "s": "Mathematical Economics", "y": { "1998": 15, "2002": 5, "2004": 11, "2007": 5, "2019": 8 }, "df": 5, "ts": 44 }, { "n": "Erich Gutenberg", "b": 1897, "d": 1984, "s": "Other", "y": { "2004": 48, "2008": 5, "2022": 5 }, "df": 3, "ts": 58 }, { "n": "Piero Sraffa", "b": 1898, "d": 1983, "s": "Post-Keynesian/Sraffian", "y": { "1993": 10, "1997": 11, "1998": 13, "2002": 11, "2003": 34, "2004": 6, "2007": 3, "2008": 3, "2010": 13, "2011": 8, "2013": 5, "2014": 8, "2015": 5, "2017": 16, "2022": 6 }, "df": 15, "ts": 152 }, { "n": "Gunnar Myrdal", "b": 1898, "d": 1987, "s": "Institutional", "y": { "1997": 5, "1998": 20, "2003": 3, "2004": 3, "2008": 14, "2010": 84, "2016": 10, "2023": 5 }, "df": 8, "ts": 144 }, { "n": "Howard Sylvester Ellis", "b": 1898, "d": 1992, "s": "Neoclassical", "y": { "1985": 3, "1999": 8, "2003": 11, "2011": 5, "2019": 24, "2023": 5 }, "df": 6, "ts": 56 }, { "n": "Jacob Marschak", "b": 1898, "d": 1977, "s": "Mathematical Economics", "y": { "2005": 13, "2011": 6, "2016": 8, "2019": 8 }, "df": 4, "ts": 35 }, { "n": "Friedrich August von Hayek", "b": 1899, "d": 1992, "s": "Austrian School", "y": { "1985": 3, "1998": 17, "1999": 8, "2000": 25, "2001": 11, "2002": 3, "2003": 24, "2004": 22, "2005": 28, "2007": 50, "2009": 11, "2010": 5, "2011": 22, "2012": 5, "2013": 5, "2014": 5, "2015": 5, "2016": 67, "2017": 56, "2019": 142, "2023": 27 }, "df": 21, "ts": 541 }, { "n": "Karl Brandt", "b": 1899, "d": 1975, "s": "Development Economics", "y": { "1993": 3, "1999": 5, "2001": 5, "2002": 5, "2005": 10, "2006": 5, "2010": 10, "2011": 5, "2018": 5, "2021": 10 }, "df": 10, "ts": 63 }, { "n": "Wilhelm R\xF6pke", "b": 1899, "d": 1966, "s": "Ordoliberalismus", "y": { "1992": 72, "1996": 8, "1997": 8, "2001": 3, "2004": 123, "2011": 21, "2016": 5, "2019": 8, "2023": 5 }, "df": 9, "ts": 253 }, { "n": "Bertil Gotthard Ohlin", "b": 1899, "d": 1979, "s": "Neoclassical", "y": { "1985": 6, "2008": 16, "2015": 8 }, "df": 3, "ts": 30 }, { "n": "Gottfried von Haberler", "b": 1900, "d": 1995, "s": "Austrian School", "y": { "1983": 5, "1985": 3, "2003": 5, "2004": 3, "2008": 5, "2011": 9, "2013": 8, "2017": 24, "2019": 26, "2023": 10 }, "df": 10, "ts": 98 }, { "n": "Erich Schneider", "b": 1900, "d": 1970, "s": "Neoclassical", "y": { "1985": 6, "1992": 6, "1996": 5, "2001": 6, "2003": 23, "2004": 143, "2011": 3, "2014": 8, "2015": 8, "2018": 3 }, "df": 10, "ts": 211 }, { "n": "Fritz Neumark", "b": 1900, "d": 1991, "s": "Other", "y": { "1992": 12, "2001": 8, "2004": 82, "2018": 5, "2019": 9, "2021": 3 }, "df": 6, "ts": 119 }, { "n": "Maurice Herbert Dobb", "b": 1900, "d": 1976, "s": "Marxist", "y": { "1994": 5, "1998": 5, "2010": 8, "2013": 5, "2018": 5 }, "df": 5, "ts": 28 }, { "n": "Friedrich August Lutz", "b": 1901, "d": 1975, "s": "Ordoliberalismus", "y": { "2004": 9, "2006": 5, "2011": 3, "2015": 26, "2019": 14, "2023": 58 }, "df": 6, "ts": 115 }, { "n": "Alfred M\xFCller-Armack", "b": 1901, "d": 1978, "s": "Ordoliberalismus", "y": { "1996": 5, "2000": 10, "2004": 3, "2011": 3 }, "df": 4, "ts": 21 }, { "n": "Simon Smith Kuznets", "b": 1901, "d": 1985, "s": "Development Economics", "y": { "2001": 16, "2011": 6, "2016": 8, "2019": 3 }, "df": 4, "ts": 33 }, { "n": "Oskar Morgenstern", "b": 1902, "d": 1977, "s": "Austrian School", "y": { "1992": 3, "2003": 13, "2005": 5, "2009": 3, "2011": 9, "2014": 3, "2019": 45, "2023": 5 }, "df": 8, "ts": 86 }, { "n": "Fritz Machlup", "b": 1902, "d": 1983, "s": "Austrian School", "y": { "2004": 6, "2005": 45, "2007": 11, "2011": 9, "2014": 3, "2017": 6, "2023": 5 }, "df": 7, "ts": 85 }, { "n": "Fritz Burchardt", "b": 1902, "d": 1958, "s": "Keynesian", "y": { "1994": 5, "2004": 3, "2010": 5, "2011": 13, "2019": 26 }, "df": 5, "ts": 52 }, { "n": "Karl Raimund Popper", "b": 1902, "d": 1994, "s": "Philosophy", "y": { "1998": 32, "1999": 5, "2001": 15 }, "df": 3, "ts": 52 }, { "n": "Joan Violet Robinson", "b": 1903, "d": 1983, "s": "Post-Keynesian/Sraffian", "y": { "1987": 3, "1992": 3, "1997": 5, "1998": 5, "2010": 21, "2012": 12, "2015": 5, "2017": 5, "2023": 9 }, "df": 9, "ts": 68 }, { "n": "Jan Tinbergen", "b": 1903, "d": 1994, "s": "Mathematical Economics", "y": { "1996": 8, "2003": 11, "2004": 3, "2007": 8, "2019": 3 }, "df": 5, "ts": 33 }, { "n": "John Richard Hicks", "b": 1904, "d": 1989, "s": "Neoclassical", "y": { "1989": 5, "1994": 8, "1997": 5, "1998": 5, "1999": 3, "2002": 10, "2003": 8, "2004": 5, "2010": 23, "2013": 11, "2015": 13, "2017": 8, "2019": 18 }, "df": 13, "ts": 122 }, { "n": "Wilhelm Abel", "b": 1904, "d": 1985, "s": "Historical School", "y": { "2001": 8, "2003": 11, "2004": 8, "2006": 8, "2016": 8 }, "df": 5, "ts": 43 }, { "n": "Alexander Gerschenkron", "b": 1904, "d": 1978, "s": "Development Economics", "y": { "1999": 5, "2003": 5, "2019": 8 }, "df": 3, "ts": 18 }, { "n": "Colin Clark", "b": 1905, "d": 1989, "s": "Development Economics", "y": { "1993": 8, "1994": 3, "1999": 3, "2001": 11, "2003": 3, "2009": 5, "2011": 29, "2012": 15, "2013": 8, "2016": 16, "2022": 3 }, "df": 11, "ts": 104 }, { "n": "Heinrich von Stackelberg", "b": 1905, "d": 1946, "s": "Mathematical Economics", "y": { "2003": 46, "2004": 9, "2015": 5, "2017": 3 }, "df": 4, "ts": 63 }, { "n": "Roy George Douglas Allen", "b": 1906, "d": 1983, "s": "Mathematical Economics", "y": { "2001": 5, "2007": 5, "2008": 3, "2010": 8, "2014": 5, "2016": 25, "2023": 5 }, "df": 7, "ts": 56 }, { "n": "August L\xF6sch", "b": 1906, "d": 1945, "s": "Raumwirtschaftslehre", "y": { "1987": 3, "2008": 44, "2014": 30, "2017": 14, "2019": 30 }, "df": 5, "ts": 121 }, { "n": "Wassily Leontief", "b": 1906, "d": 1999, "s": "Mathematical Economics", "y": { "1994": 5, "2002": 10, "2011": 6 }, "df": 3, "ts": 21 }, { "n": "Hannah Arendt", "b": 1906, "d": 1975, "s": "Philosophy", "y": { "2006": 3, "2013": 5, "2015": 5 }, "df": 3, "ts": 13 }, { "n": "Jean Fourasti\xE9", "b": 1907, "d": 1990, "s": "Development Economics", "y": { "1999": 5, "2013": 11, "2016": 5 }, "df": 3, "ts": 21 }, { "n": "Nicholas Kaldor", "b": 1908, "d": 1986, "s": "Post-Keynesian/Sraffian", "y": { "1997": 5, "2002": 13, "2008": 8, "2009": 5, "2010": 8, "2015": 11, "2023": 3 }, "df": 7, "ts": 53 }, { "n": "Werner Stark", "b": 1909, "d": 1985, "s": "Historical School", "y": { "1998": 6, "2001": 11, "2018": 5 }, "df": 3, "ts": 22 }, { "n": "Charles Poor Kindleberger", "b": 1910, "d": 2003, "s": "Development Economics", "y": { "2007": 5, "2011": 5, "2017": 8, "2018": 5, "2019": 8, "2021": 5 }, "df": 6, "ts": 36 }, { "n": "Richard Abel Musgrave", "b": 1910, "d": 2007, "s": "Other", "y": { "1985": 3, "1992": 12, "1997": 5, "1998": 29, "2005": 5, "2011": 9 }, "df": 6, "ts": 63 }, { "n": "Kenneth Ewart Boulding", "b": 1910, "d": 1993, "s": "Institutional", "y": { "2004": 3, "2005": 8, "2022": 5 }, "df": 3, "ts": 16 }, { "n": "George Joseph Stigler", "b": 1911, "d": 1991, "s": "Neoclassical", "y": { "1997": 13, "2000": 5, "2002": 16, "2011": 5 }, "df": 4, "ts": 39 }, { "n": "Georg Peter Landmann", "b": 1911, "d": 1994, "s": "Philosophy", "y": { "1992": 24, "2004": 5, "2005": 22, "2021": 10 }, "df": 4, "ts": 61 }, { "n": "Milton Friedman", "b": 1912, "d": 2006, "s": "Neoclassical", "y": { "1983": 15, "1999": 8, "2001": 8, "2004": 6, "2005": 16, "2007": 15, "2011": 60, "2013": 5, "2016": 13, "2017": 8, "2019": 13 }, "df": 11, "ts": 167 }, { "n": "Terence Wilmot Hutchison", "b": 1912, "d": 2007, "s": "Philosophy", "y": { "1983": 8, "2001": 6, "2004": 3, "2005": 8, "2007": 5, "2018": 5, "2021": 5 }, "df": 7, "ts": 40 }, { "n": "John Richard Nicholas Stone", "b": 1913, "d": 1991, "s": "Mathematical Economics", "y": { "2007": 3, "2011": 11, "2012": 14 }, "df": 3, "ts": 28 }, { "n": "Paul Anthony Samuelson", "b": 1915, "d": 2009, "s": "Neoclassical", "y": { "1980": 8, "1985": 6, "1994": 3, "1997": 10, "1999": 3, "2000": 10, "2001": 16, "2002": 15, "2004": 8, "2007": 14, "2008": 22, "2010": 8, "2011": 11, "2013": 8, "2015": 19, "2016": 13, "2017": 5, "2019": 21, "2022": 16, "2023": 3 }, "df": 20, "ts": 219 }, { "n": "Albert Otto Hirschman", "b": 1915, "d": 2012, "s": "Development Economics", "y": { "2010": 18, "2011": 3, "2018": 21, "2021": 8, "2022": 5, "2023": 5 }, "df": 6, "ts": 60 }, { "n": "Hans Brems", "b": 1915, "d": 2e3, "s": "Mathematical Economics", "y": { "2000": 5, "2002": 8, "2004": 8 }, "df": 3, "ts": 21 }, { "n": "Herbert Alexander Simon", "b": 1916, "d": 2001, "s": "Institutional", "y": { "1998": 6, "2007": 5, "2011": 3, "2012": 5, "2018": 3, "2019": 9, "2021": 3 }, "df": 7, "ts": 34 }, { "n": "Wilhelm Krelle", "b": 1916, "d": 2004, "s": "Mathematical Economics", "y": { "1993": 3, "2004": 5, "2008": 5, "2015": 8, "2021": 8 }, "df": 5, "ts": 29 }, { "n": "Robert Dorfman", "b": 1916, "d": 2002, "s": "Mathematical Economics", "y": { "2003": 8, "2008": 8, "2011": 23, "2016": 8, "2022": 8 }, "df": 5, "ts": 55 }, { "n": "Karl Brunner", "b": 1916, "d": 1989, "s": "Neoclassical", "y": { "2004": 10, "2011": 40, "2018": 8, "2021": 5 }, "df": 4, "ts": 63 }, { "n": "J\xFCrg Niehans", "b": 1919, "d": 2007, "s": "Neoclassical", "y": { "1993": 3, "1994": 3, "2001": 8, "2003": 5, "2004": 8, "2008": 10, "2010": 8, "2011": 6, "2019": 3, "2021": 8 }, "df": 10, "ts": 62 }, { "n": "James McGill Buchanan", "b": 1919, "d": 2013, "s": "Institutional", "y": { "1992": 6, "1997": 11, "1998": 13, "2001": 8, "2004": 8, "2005": 8, "2007": 5, "2014": 13, "2016": 8, "2022": 13 }, "df": 10, "ts": 93 }, { "n": "Karl H\xE4user", "b": 1920, "d": 1995, "s": "Historical School", "y": { "1990": 3, "1996": 8, "1998": 6, "1999": 20, "2003": 16, "2004": 28, "2005": 8, "2007": 5 }, "df": 8, "ts": 94 }, { "n": "Kenneth Joseph Arrow", "b": 1921, "d": 2017, "s": "Neoclassical", "y": { "2002": 8, "2005": 43, "2007": 8, "2012": 5, "2016": 13 }, "df": 5, "ts": 77 }, { "n": "Herbert Giersch", "b": 1921, "d": 2010, "s": "Neoclassical", "y": { "2002": 5, "2004": 26, "2008": 5, "2021": 3 }, "df": 4, "ts": 39 }, { "n": "William Jack Baumol", "b": 1922, "d": 2017, "s": "Neoclassical", "y": { "1980": 5, "1992": 3, "1998": 5, "2007": 5, "2011": 5, "2013": 16, "2014": 16, "2016": 5, "2017": 5 }, "df": 9, "ts": 65 }, { "n": "Don Patinkin", "b": 1922, "d": 1995, "s": "Keynesian", "y": { "1983": 3, "1997": 11, "1998": 5, "2007": 11, "2014": 3, "2019": 122, "2023": 8 }, "df": 7, "ts": 163 }, { "n": "Alfred B\xFCrgin", "b": 1922, "d": 2009, "s": "Historical School", "y": { "2001": 16, "2004": 8, "2006": 5, "2018": 21 }, "df": 4, "ts": 50 }, { "n": "Thomas Samuel Kuhn", "b": 1922, "d": 1996, "s": "Philosophy", "y": { "1994": 3, "2001": 3, "2012": 5, "2016": 13 }, "df": 4, "ts": 24 }, { "n": "Michio Morishima", "b": 1923, "d": 2004, "s": "Mathematical Economics", "y": { "1993": 5, "2000": 8, "2005": 8, "2009": 3 }, "df": 4, "ts": 24 }, { "n": "Harry Gordon Johnson", "b": 1923, "d": 1977, "s": "Neoclassical", "y": { "1998": 8, "2011": 19, "2015": 5 }, "df": 3, "ts": 32 }, { "n": "Ernst Helmst\xE4dter", "b": 1924, "d": 2009, "s": "Evolutionary", "y": { "2001": 25, "2003": 5, "2005": 11, "2008": 3, "2010": 8, "2011": 5, "2019": 3, "2021": 8, "2022": 14 }, "df": 9, "ts": 82 }, { "n": "Robert Merton Solow", "b": 1924, "d": 2023, "s": "Neoclassical", "y": { "1998": 3, "2005": 6, "2007": 3, "2010": 6, "2011": 6, "2014": 3, "2015": 6, "2016": 14, "2017": 13 }, "df": 9, "ts": 60 }, { "n": "David Saul Landes", "b": 1924, "d": 2013, "s": "Historical School", "y": { "2000": 13, "2005": 8, "2012": 15, "2018": 5 }, "df": 4, "ts": 41 }, { "n": "Knut Borchardt", "b": 1926, "d": 2019, "s": "Historical School", "y": { "2004": 19, "2008": 5, "2011": 10, "2012": 5, "2015": 8, "2019": 5, "2021": 18 }, "df": 7, "ts": 70 }, { "n": "John Somerset Chipman", "b": 1926, "d": 2022, "s": "Mathematical Economics", "y": { "1999": 5, "2003": 5, "2005": 5, "2010": 16, "2018": 8 }, "df": 5, "ts": 39 }, { "n": "Rudolf Richter", "b": 1926, "d": 2021, "s": "Institutional", "y": { "1998": 11, "2004": 19, "2011": 6, "2012": 5, "2015": 5 }, "df": 5, "ts": 46 }, { "n": "Mark Blaug", "b": 1927, "d": 2011, "s": "Contemporary", "y": { "1980": 5, "1992": 3, "1994": 3, "1997": 10, "1998": 23, "2000": 5, "2001": 44, "2002": 5, "2003": 5, "2005": 5, "2007": 5, "2008": 10, "2011": 5, "2013": 5, "2014": 34, "2015": 10, "2017": 5, "2022": 13 }, "df": 18, "ts": 195 }, { "n": "Niklas Luhmann", "b": 1927, "d": 1998, "s": "Other", "y": { "2008": 5, "2016": 8, "2018": 10 }, "df": 3, "ts": 23 }, { "n": "Harald Winkel", "b": 1928, "d": 1995, "s": "Historical School", "y": { "1982": 3, "1990": 3, "2001": 3, "2002": 10, "2003": 8, "2005": 5, "2015": 9, "2021": 3 }, "df": 8, "ts": 44 }, { "n": "Peter Bernholz", "b": 1929, "d": 2023, "s": "Neoclassical", "y": { "1985": 3, "2003": 5, "2004": 5, "2015": 5 }, "df": 4, "ts": 18 }, { "n": "Hans Christoph Binswanger", "b": 1929, "d": 2018, "s": "Other", "y": { "1998": 3, "2002": 5, "2015": 5, "2018": 18 }, "df": 4, "ts": 31 }, { "n": "Robert V. Eagly", "b": 1929, "d": 1995, "s": "Historical School", "y": { "1982": 3, "2003": 5, "2018": 5 }, "df": 3, "ts": 13 }, { "n": "Edwin von B\xF6venter", "b": 1929, "d": 2e3, "s": "Raumwirtschaftslehre", "y": { "2006": 5, "2008": 8, "2014": 8 }, "df": 3, "ts": 21 }, { "n": "Israel Meir Kirzner", "b": 1930, "d": null, "s": "Austrian School", "y": { "1997": 5, "2004": 3, "2005": 5, "2007": 6, "2011": 5 }, "df": 5, "ts": 24 }, { "n": "Luigi Lodovico Pasinetti", "b": 1930, "d": 2023, "s": "Post-Keynesian/Sraffian", "y": { "1998": 8, "2002": 5, "2010": 11, "2014": 19, "2015": 5 }, "df": 5, "ts": 48 }, { "n": "Pierangelo Garegnani", "b": 1930, "d": 2011, "s": "Post-Keynesian/Sraffian", "y": { "1997": 5, "1998": 8, "2013": 5, "2017": 8, "2023": 3 }, "df": 5, "ts": 29 }, { "n": "Paul Davidson", "b": 1930, "d": 2022, "s": "Post-Keynesian/Sraffian", "y": { "2004": 5, "2007": 5, "2011": 5, "2019": 8 }, "df": 4, "ts": 23 }, { "n": "Karl Heinrich Kaufhold", "b": 1931, "d": 2016, "s": "Historical School", "y": { "2006": 15, "2012": 10, "2021": 10 }, "df": 3, "ts": 35 }, { "n": "Erich Wolfgang Streissler", "b": 1933, "d": 2019, "s": "Austrian School", "y": { "1993": 3, "1995": 45, "1997": 5, "1999": 11, "2000": 5, "2005": 5, "2006": 3, "2010": 5, "2011": 17, "2012": 5, "2013": 8, "2021": 3 }, "df": 12, "ts": 115 }, { "n": "Axel Leijonhufvud", "b": 1933, "d": 2022, "s": "Keynesian", "y": { "1983": 14, "1997": 13, "2003": 3, "2004": 18, "2011": 6, "2015": 8, "2016": 8, "2019": 8 }, "df": 8, "ts": 78 }, { "n": "Takashi Negishi", "b": 1933, "d": null, "s": "Neoclassical", "y": { "1997": 3, "2001": 8, "2006": 5, "2008": 8 }, "df": 4, "ts": 24 }, { "n": "Hajo Riese", "b": 1934, "d": 2015, "s": "Post-Keynesian/Sraffian", "y": { "1983": 3, "1998": 5, "2004": 39, "2016": 8, "2019": 5 }, "df": 5, "ts": 60 }, { "n": "Robert Emerson Lucas Jr.", "b": 1937, "d": 2023, "s": "Neoclassical", "y": { "2004": 8, "2005": 22, "2010": 8, "2011": 8, "2016": 8, "2017": 8, "2019": 3, "2022": 3 }, "df": 8, "ts": 68 }, { "n": "Klaus Hinrich Hennings", "b": 1937, "d": 1986, "s": "Austrian School", "y": { "1995": 9, "1999": 3, "2001": 5, "2004": 18, "2013": 5, "2015": 10 }, "df": 6, "ts": 50 }, { "n": "David Ernest William Laidler", "b": 1938, "d": null, "s": "Keynesian", "y": { "1983": 8, "1997": 17, "1998": 10, "1999": 8, "2011": 12, "2017": 5, "2019": 8 }, "df": 7, "ts": 68 }, { "n": "Peter Groenewegen", "b": 1939, "d": 2016, "s": "Contemporary", "y": { "1993": 5, "1994": 3, "2016": 8, "2019": 8 }, "df": 4, "ts": 24 }, { "n": "Peter Kalmbach", "b": 1939, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "2011": 3, "2013": 5, "2015": 14 }, "df": 3, "ts": 22 }, { "n": "Ian Steedman", "b": 1941, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "1997": 8, "2003": 5, "2005": 5, "2010": 9 }, "df": 4, "ts": 27 }, { "n": "Joseph Eugene Stiglitz", "b": 1943, "d": null, "s": "Contemporary", "y": { "2004": 8, "2005": 3, "2007": 3, "2008": 3, "2010": 3, "2012": 5, "2015": 3, "2016": 3 }, "df": 8, "ts": 31 }, { "n": "Eliot Roy Weintraub", "b": 1943, "d": null, "s": "Contemporary", "y": { "2001": 8, "2002": 5, "2005": 3, "2006": 5 }, "df": 4, "ts": 21 }, { "n": "Jan Allen Kregel", "b": 1944, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "2004": 13, "2017": 5, "2022": 5 }, "df": 3, "ts": 23 }, { "n": "Sergio Cremaschi", "b": 1945, "d": null, "s": "Philosophy", "y": { "2014": 5, "2016": 5, "2022": 9 }, "df": 3, "ts": 19 }, { "n": "Geoffrey Martin Hodgson", "b": 1946, "d": null, "s": "Institutional", "y": { "2012": 13, "2016": 63, "2021": 13, "2023": 3 }, "df": 4, "ts": 92 }, { "n": "Joel Mokyr", "b": 1946, "d": null, "s": "Evolutionary", "y": { "2012": 31, "2016": 5, "2017": 11 }, "df": 3, "ts": 47 }, { "n": "Istv\xE1n Hont", "b": 1947, "d": 2013, "s": "Historical School", "y": { "2003": 5, "2018": 18, "2022": 11 }, "df": 3, "ts": 34 }, { "n": "Richard Swedberg", "b": 1948, "d": null, "s": "Institutional", "y": { "2001": 8, "2012": 5, "2015": 3, "2016": 5 }, "df": 4, "ts": 21 }, { "n": "Keith Tribe", "b": 1949, "d": null, "s": "Historical School", "y": { "1994": 6, "2003": 8, "2006": 3, "2011": 3, "2014": 3, "2015": 3, "2018": 8, "2019": 3, "2021": 3 }, "df": 9, "ts": 40 }, { "n": "J\xFCrgen Georg Backhaus", "b": 1950, "d": null, "s": "Institutional", "y": { "1996": 5, "2001": 14, "2003": 8, "2007": 5, "2014": 10, "2016": 5, "2021": 15, "2023": 3 }, "df": 8, "ts": 65 }, { "n": "Ulrich van Suntum", "b": 1950, "d": null, "s": "Ordoliberalismus", "y": { "1993": 6, "2008": 5, "2015": 8, "2022": 9 }, "df": 4, "ts": 28 }, { "n": "Don Lavoie", "b": 1951, "d": 2001, "s": "Austrian School", "y": { "2005": 5, "2007": 12, "2011": 8, "2023": 5 }, "df": 4, "ts": 30 }, { "n": "Uskali M\xE4ki", "b": 1951, "d": null, "s": "Philosophy", "y": { "2001": 3, "2005": 5, "2008": 8 }, "df": 3, "ts": 16 }, { "n": "Paul Robin Krugman", "b": 1953, "d": null, "s": "Raumwirtschaftslehre", "y": { "2007": 11, "2008": 75, "2010": 89, "2011": 6, "2014": 6, "2017": 19, "2018": 5, "2019": 8 }, "df": 8, "ts": 219 }, { "n": "Daniele Besomi", "b": 1963, "d": null, "s": "Contemporary", "y": { "2001": 3, "2013": 8, "2019": 5 }, "df": 3, "ts": 16 }, { "n": "Charles I. Jones", "b": 1968, "d": null, "s": "Contemporary", "y": { "1998": 3, "2000": 5, "2001": 3, "2005": 11, "2012": 5, "2017": 8 }, "df": 6, "ts": 35 }];
var FIGS_ALL = [{ "n": "Francis Bacon", "b": 1561, "d": 1626, "s": "Philosophy", "y": { "2000": 8, "2004": 5, "2005": 5, "2016": 5, "2018": 5 }, "df": 5, "ts": 28 }, { "n": "Thomas Hobbes", "b": 1588, "d": 1679, "s": "Philosophy", "y": { "1998": 9, "2000": 5, "2014": 5, "2018": 5 }, "df": 4, "ts": 24 }, { "n": "John Locke", "b": 1632, "d": 1704, "s": "Classical", "y": { "1995": 3, "1999": 3, "2000": 10, "2004": 3, "2005": 5, "2007": 10, "2008": 5, "2011": 8, "2014": 3, "2018": 15 }, "df": 10, "ts": 65 }, { "n": "Charles Davenant", "b": 1656, "d": 1714, "s": "Classical", "y": { "2007": 10, "2018": 8 }, "df": 2, "ts": 18 }, { "n": "Richard Cantillon", "b": 1680, "d": 1734, "s": "Classical", "y": { "2001": 5, "2008": 3, "2018": 5 }, "df": 3, "ts": 13 }, { "n": "Daniel Bernoulli", "b": 1700, "d": 1782, "s": "Mathematical Economics", "y": { "1999": 8, "2001": 5, "2005": 5, "2007": 23 }, "df": 4, "ts": 41 }, { "n": "David Hume", "b": 1711, "d": 1776, "s": "Classical", "y": { "1997": 5, "1998": 3, "2000": 15, "2001": 3, "2003": 3, "2005": 5, "2018": 28, "2022": 25 }, "df": 8, "ts": 87 }, { "n": "Adam Smith", "b": 1723, "d": 1790, "s": "Classical", "y": { "1980": 5, "1985": 9, "1989": 3, "1995": 39, "1998": 21, "1999": 17, "2000": 40, "2002": 5, "2003": 10, "2004": 3, "2005": 25, "2008": 13, "2012": 3, "2013": 3, "2014": 6, "2016": 11, "2018": 3, "2019": 5, "2022": 100, "2023": 5 }, "df": 20, "ts": 326 }, { "n": "Adam Ferguson", "b": 1723, "d": 1816, "s": "Classical", "y": { "1997": 5, "2000": 5, "2001": 5, "2014": 5, "2022": 5 }, "df": 5, "ts": 25 }, { "n": "Immanuel Kant", "b": 1724, "d": 1804, "s": "Philosophy", "y": { "2003": 3, "2005": 8, "2016": 16, "2022": 10 }, "df": 4, "ts": 37 }, { "n": "Jeremy Bentham", "b": 1748, "d": 1832, "s": "Classical", "y": { "1998": 65, "1999": 8 }, "df": 2, "ts": 73 }, { "n": "Georg Friedrich von Sartorius", "b": 1765, "d": 1828, "s": "Classical", "y": { "1985": 15, "1999": 6, "2003": 10, "2005": 8 }, "df": 4, "ts": 39 }, { "n": "Wilhelm von Humboldt", "b": 1767, "d": 1835, "s": "Philosophy", "y": { "2005": 8, "2009": 3, "2016": 8 }, "df": 3, "ts": 19 }, { "n": "Georg Wilhelm Friedrich Hegel", "b": 1770, "d": 1831, "s": "Philosophy", "y": { "2005": 5, "2009": 5, "2013": 5, "2022": 15 }, "df": 4, "ts": 30 }, { "n": "David Ricardo", "b": 1772, "d": 1823, "s": "Classical", "y": { "1980": 5, "1985": 24, "1988": 3, "1993": 10, "1995": 3, "1998": 10, "2002": 5, "2007": 31, "2008": 8, "2014": 28, "2016": 5, "2017": 5, "2022": 15, "2023": 3 }, "df": 14, "ts": 155 }, { "n": "Robert Torrens", "b": 1780, "d": 1864, "s": "Classical", "y": { "1999": 3, "2003": 5, "2007": 5 }, "df": 3, "ts": 13 }, { "n": "Georg Franz August de Longueval, Count of Buquoy", "b": 1781, "d": 1851, "s": "Other", "y": { "2001": 8, "2002": 31 }, "df": 2, "ts": 39 }, { "n": "Johann Heinrich von Th\xFCnen", "b": 1783, "d": 1850, "s": "Raumwirtschaftslehre", "y": { "1985": 3, "1987": 3, "1993": 6, "2002": 3, "2005": 5, "2008": 24, "2014": 3 }, "df": 7, "ts": 47 }, { "n": "Friedrich List", "b": 1789, "d": 1846, "s": "National Economy", "y": { "1999": 3, "2001": 8, "2002": 10, "2008": 5, "2013": 8, "2018": 5 }, "df": 6, "ts": 39 }, { "n": "Charles Babbage", "b": 1791, "d": 1871, "s": "Mathematical Economics", "y": { "1998": 8, "2002": 10, "2004": 5, "2005": 8 }, "df": 4, "ts": 31 }, { "n": "Karl Heinrich Rau", "b": 1792, "d": 1870, "s": "Historical School", "y": { "1999": 5, "2005": 5, "2010": 5, "2011": 5, "2013": 5 }, "df": 5, "ts": 25 }, { "n": "Friedrich Benedict Wilhelm von Hermann", "b": 1795, "d": 1868, "s": "Classical", "y": { "1985": 9, "1992": 9, "1993": 30, "1997": 8, "1998": 5, "1999": 9, "2001": 3, "2004": 6, "2008": 8, "2009": 12, "2011": 5, "2015": 5, "2016": 3, "2019": 3 }, "df": 14, "ts": 115 }, { "n": "John Rae", "b": 1796, "d": 1872, "s": "Classical", "y": { "1997": 5, "2005": 5, "2022": 5 }, "df": 3, "ts": 15 }, { "n": "Johann Karl Rodbertus-Jagetzow", "b": 1805, "d": 1875, "s": "Marxist", "y": { "2013": 5, "2015": 8 }, "df": 2, "ts": 13 }, { "n": "John Stuart Mill", "b": 1806, "d": 1873, "s": "Classical", "y": { "1980": 5, "1985": 18, "1986": 3, "1988": 3, "1989": 5, "1995": 6, "1998": 543, "1999": 5, "2002": 10, "2005": 5, "2008": 5, "2013": 8, "2016": 26, "2019": 5, "2023": 16 }, "df": 15, "ts": 663 }, { "n": "Bruno Hildebrand", "b": 1812, "d": 1878, "s": "Historical School", "y": { "1998": 8, "1999": 102, "2001": 8, "2003": 15, "2005": 5, "2010": 18, "2011": 8, "2013": 5, "2014": 3 }, "df": 9, "ts": 172 }, { "n": "Lorenz von Stein", "b": 1815, "d": 1890, "s": "Historical School", "y": { "1985": 9, "1992": 6, "1999": 3, "2003": 8, "2009": 3, "2013": 11 }, "df": 6, "ts": 40 }, { "n": "Wilhelm Georg Friedrich Roscher", "b": 1817, "d": 1894, "s": "Historical School", "y": { "1982": 9, "1985": 9, "1993": 11, "1995": 21, "1998": 10, "1999": 35, "2001": 22, "2002": 5, "2003": 5, "2005": 10, "2008": 11, "2010": 20, "2011": 5, "2022": 3 }, "df": 14, "ts": 176 }, { "n": "Karl Marx", "b": 1818, "d": 1883, "s": "Marxist", "y": { "1980": 5, "1993": 6, "1998": 10, "1999": 8, "2001": 8, "2002": 43, "2003": 35, "2005": 5, "2013": 29, "2014": 11, "2015": 5, "2016": 18, "2019": 10, "2022": 13, "2023": 3 }, "df": 15, "ts": 209 }, { "n": "Friedrich Engels", "b": 1820, "d": 1895, "s": "Marxist", "y": { "1990": 3, "1999": 17, "2003": 5, "2004": 3, "2013": 5, "2021": 8, "2022": 8 }, "df": 7, "ts": 49 }, { "n": "John Elliott Cairnes", "b": 1823, "d": 1875, "s": "Classical", "y": { "1998": 5, "2001": 5, "2002": 5 }, "df": 3, "ts": 15 }, { "n": "Walter Bagehot", "b": 1826, "d": 1877, "s": "Classical", "y": { "1986": 3, "1998": 13, "2001": 5, "2003": 5, "2022": 5 }, "df": 5, "ts": 31 }, { "n": "Hermann Roesler", "b": 1834, "d": 1894, "s": "Historical School", "y": { "1999": 6, "2003": 5, "2018": 5 }, "df": 3, "ts": 16 }, { "n": "William Stanley Jevons", "b": 1835, "d": 1882, "s": "Neoclassical", "y": { "1989": 15, "1990": 3, "1994": 3, "1997": 10, "1998": 11, "1999": 6, "2007": 3, "2008": 5, "2011": 11, "2017": 13 }, "df": 10, "ts": 80 }, { "n": "Adolph Wagner", "b": 1835, "d": 1917, "s": "Historical School", "y": { "1985": 3, "1992": 45, "1998": 6, "1999": 14, "2005": 5, "2009": 3, "2016": 12 }, "df": 7, "ts": 88 }, { "n": "Eugen von Bergmann", "b": 1836, "d": 1904, "s": "Historical School", "y": { "2009": 8, "2019": 8 }, "df": 2, "ts": 16 }, { "n": "Gustav von Schmoller", "b": 1838, "d": 1917, "s": "Historical School", "y": { "1985": 18, "1992": 6, "2001": 17, "2007": 13, "2008": 11, "2009": 8, "2011": 5, "2016": 8, "2018": 5, "2021": 12, "2023": 21 }, "df": 11, "ts": 124 }, { "n": "Carl Menger", "b": 1840, "d": 1921, "s": "Austrian School", "y": { "1995": 3, "1998": 14, "1999": 20, "2001": 6, "2002": 5, "2003": 8, "2004": 3, "2006": 12, "2007": 8, "2011": 14, "2013": 5, "2015": 23, "2016": 5, "2019": 6 }, "df": 14, "ts": 132 }, { "n": "Gustav Cohn", "b": 1840, "d": 1919, "s": "Historical School", "y": { "1992": 6, "2004": 8, "2009": 5 }, "df": 3, "ts": 19 }, { "n": "Alfred Marshall", "b": 1842, "d": 1924, "s": "Neoclassical", "y": { "1980": 5, "1983": 3, "1989": 5, "1993": 3, "1994": 9, "1995": 3, "1998": 5, "1999": 12, "2002": 23, "2003": 10, "2005": 5, "2008": 3, "2010": 19, "2011": 5, "2012": 8, "2013": 5, "2015": 5, "2019": 23, "2022": 3 }, "df": 19, "ts": 154 }, { "n": "Georg Friedrich Knapp", "b": 1842, "d": 1926, "s": "Historical School", "y": { "1993": 3, "1999": 8, "2004": 6, "2019": 39, "2023": 5 }, "df": 5, "ts": 61 }, { "n": "Lujo Brentano", "b": 1844, "d": 1931, "s": "Historical School", "y": { "1994": 3, "2000": 13, "2003": 5, "2009": 8, "2012": 5, "2018": 5, "2019": 8, "2021": 18, "2023": 3 }, "df": 9, "ts": 68 }, { "n": "Friedrich Wilhelm Nietzsche", "b": 1844, "d": 1900, "s": "Philosophy", "y": { "2013": 5, "2016": 5 }, "df": 2, "ts": 10 }, { "n": "Francis Ysidro Edgeworth", "b": 1845, "d": 1926, "s": "Neoclassical", "y": { "1985": 6, "1992": 9, "1998": 51, "2002": 5, "2003": 13, "2010": 10 }, "df": 6, "ts": 94 }, { "n": "Karl B\xFCcher", "b": 1847, "d": 1930, "s": "Historical School", "y": { "2002": 5, "2004": 8, "2006": 5, "2008": 5, "2011": 8, "2021": 13 }, "df": 6, "ts": 44 }, { "n": "Wilhelm Hasbach", "b": 1849, "d": 1920, "s": "Historical School", "y": { "2001": 8, "2003": 8, "2022": 5 }, "df": 3, "ts": 21 }, { "n": "Knut Wicksell", "b": 1851, "d": 1926, "s": "Neoclassical", "y": { "1992": 21, "1993": 8, "1997": 58, "1999": 6, "2002": 40, "2003": 15, "2004": 3, "2008": 3, "2010": 16, "2011": 8, "2015": 10, "2017": 3, "2019": 27 }, "df": 13, "ts": 218 }, { "n": "Eugen von B\xF6hm-Bawerk", "b": 1851, "d": 1914, "s": "Austrian School", "y": { "1996": 5, "1997": 5, "1998": 8, "1999": 10, "2000": 5, "2005": 8, "2007": 8, "2009": 16, "2015": 55, "2019": 8, "2021": 5, "2022": 5 }, "df": 12, "ts": 138 }, { "n": "Friedrich von Wieser", "b": 1851, "d": 1926, "s": "Austrian School", "y": { "1985": 12, "1992": 9, "1993": 3, "1995": 9, "1999": 14, "2009": 6 }, "df": 6, "ts": 53 }, { "n": "Arnold Toynbee", "b": 1852, "d": 1883, "s": "Historical School", "y": { "2000": 5, "2011": 5 }, "df": 2, "ts": 10 }, { "n": "Richard Ehrenberg", "b": 1857, "d": 1921, "s": "Historical School", "y": { "2000": 3, "2004": 37, "2009": 3, "2018": 5 }, "df": 4, "ts": 48 }, { "n": "Eugen von Philippovich", "b": 1858, "d": 1917, "s": "Austrian School", "y": { "1995": 3, "1996": 5, "2009": 3 }, "df": 3, "ts": 11 }, { "n": "Edmund Gustav Albrecht Husserl", "b": 1859, "d": 1938, "s": "Philosophy", "y": { "2021": 5, "2023": 8 }, "df": 2, "ts": 13 }, { "n": "Edwin Cannan", "b": 1861, "d": 1935, "s": "Classical", "y": { "1997": 5, "1998": 11, "2003": 10, "2007": 5, "2015": 8 }, "df": 5, "ts": 39 }, { "n": "Werner Sombart", "b": 1863, "d": 1941, "s": "Historical School", "y": { "1992": 3, "2000": 18, "2001": 6, "2002": 9, "2003": 3, "2004": 3, "2005": 3, "2006": 5, "2008": 13, "2009": 8, "2010": 6, "2011": 6, "2016": 3, "2021": 15, "2022": 6 }, "df": 15, "ts": 107 }, { "n": "Heinrich Herkner", "b": 1863, "d": 1932, "s": "Historical School", "y": { "1992": 9, "2009": 8, "2021": 22, "2023": 18 }, "df": 4, "ts": 57 }, { "n": "Max Weber", "b": 1864, "d": 1920, "s": "Historical School", "y": { "1987": 3, "1994": 21, "1999": 6, "2000": 46, "2003": 11, "2004": 3, "2005": 3, "2006": 3, "2008": 16, "2009": 6, "2011": 6, "2012": 5, "2014": 3, "2015": 3, "2021": 6, "2022": 3, "2023": 3 }, "df": 17, "ts": 147 }, { "n": "Karl Diehl", "b": 1864, "d": 1943, "s": "Historical School", "y": { "1992": 3, "1999": 5, "2001": 3, "2004": 16, "2009": 8, "2010": 3, "2011": 24, "2019": 10 }, "df": 8, "ts": 72 }, { "n": "Franz Oppenheimer", "b": 1864, "d": 1943, "s": "Historical School", "y": { "2001": 5, "2009": 3, "2015": 5 }, "df": 3, "ts": 13 }, { "n": "Karl Gustav Cassel", "b": 1866, "d": 1945, "s": "Neoclassical", "y": { "1992": 30, "1993": 8, "1997": 13, "2002": 8, "2003": 26, "2008": 5, "2009": 5, "2010": 5, "2011": 8, "2013": 8, "2015": 5, "2019": 10, "2023": 5 }, "df": 13, "ts": 136 }, { "n": "Ladislaus Josephovich von Bortkiewicz", "b": 1868, "d": 1931, "s": "Mathematical Economics", "y": { "1994": 6, "1997": 3, "2002": 3, "2008": 3, "2009": 10, "2019": 5 }, "df": 6, "ts": 30 }, { "n": "Rosa Luxemburg", "b": 1871, "d": 1919, "s": "Marxist", "y": { "2008": 5, "2013": 3, "2023": 10 }, "df": 3, "ts": 18 }, { "n": "Moritz Julius Bonn", "b": 1873, "d": 1965, "s": "Historical School", "y": { "1984": 3, "2004": 3, "2019": 10, "2021": 5 }, "df": 4, "ts": 21 }, { "n": "Ernst Cassirer", "b": 1874, "d": 1945, "s": "Philosophy", "y": { "2005": 5, "2022": 5 }, "df": 2, "ts": 10 }, { "n": "Arthur Cecil Pigou", "b": 1877, "d": 1959, "s": "Neoclassical", "y": { "1992": 15, "1994": 3, "1995": 3, "1998": 23, "2002": 3, "2003": 8, "2011": 3, "2013": 8, "2017": 8, "2019": 8 }, "df": 10, "ts": 82 }, { "n": "Karl Pribram", "b": 1877, "d": 1973, "s": "Austrian School", "y": { "2000": 11, "2001": 11, "2003": 5, "2009": 8, "2011": 5, "2018": 3, "2023": 13 }, "df": 7, "ts": 56 }, { "n": "Rudolf Hilferding", "b": 1877, "d": 1941, "s": "Marxist", "y": { "2009": 10, "2013": 3, "2019": 27, "2022": 8, "2023": 10 }, "df": 5, "ts": 58 }, { "n": "Hans Mayer", "b": 1879, "d": 1955, "s": "Austrian School", "y": { "1985": 3, "1992": 9, "2000": 11, "2008": 3, "2009": 24, "2011": 9, "2013": 3 }, "df": 7, "ts": 62 }, { "n": "Ralph George Hawtrey", "b": 1879, "d": 1975, "s": "Keynesian", "y": { "1997": 14, "2007": 8, "2017": 5, "2019": 8 }, "df": 4, "ts": 35 }, { "n": "Eli Filip Heckscher", "b": 1879, "d": 1952, "s": "Neoclassical", "y": { "1985": 3, "2003": 5, "2012": 13, "2018": 13 }, "df": 4, "ts": 34 }, { "n": "Ludwig von Mises", "b": 1881, "d": 1973, "s": "Austrian School", "y": { "1997": 5, "1998": 11, "1999": 8, "2000": 5, "2007": 14, "2009": 9, "2011": 9, "2014": 3, "2019": 19, "2023": 13 }, "df": 10, "ts": 96 }, { "n": "Otto Bauer", "b": 1881, "d": 1938, "s": "Marxist", "y": { "2001": 16, "2007": 8, "2009": 13, "2013": 3, "2019": 5, "2023": 35 }, "df": 6, "ts": 80 }, { "n": "Frederick Lavington", "b": 1881, "d": 1927, "s": "Keynesian", "y": { "1998": 5, "2013": 5, "2019": 16 }, "df": 3, "ts": 26 }, { "n": "Joseph Alois Schumpeter", "b": 1883, "d": 1950, "s": "Evolutionary", "y": { "1982": 3, "1983": 6, "1985": 21, "1989": 5, "1992": 21, "1993": 9, "1996": 5, "1997": 8, "1998": 8, "1999": 8, "2001": 12, "2002": 5, "2003": 25, "2004": 3, "2005": 43, "2006": 3, "2007": 13, "2008": 10, "2009": 15, "2011": 24, "2012": 8, "2014": 15, "2015": 15, "2016": 91, "2017": 36, "2018": 3, "2019": 35, "2021": 3, "2022": 41, "2023": 38 }, "df": 30, "ts": 532 }, { "n": "John Maynard Keynes", "b": 1883, "d": 1946, "s": "Keynesian", "y": { "1983": 36, "1994": 9, "1996": 8, "1997": 11, "1998": 16, "1999": 11, "2000": 10, "2003": 5, "2004": 27, "2005": 5, "2007": 27, "2014": 9, "2015": 5, "2016": 5, "2017": 72, "2018": 10, "2019": 83, "2023": 11 }, "df": 18, "ts": 360 }, { "n": "Alfred Amonn", "b": 1883, "d": 1962, "s": "Austrian School", "y": { "1992": 27, "2009": 16, "2011": 8, "2013": 5, "2017": 5 }, "df": 5, "ts": 61 }, { "n": "Frank Hyneman Knight", "b": 1885, "d": 1972, "s": "Neoclassical", "y": { "1997": 5, "1998": 5, "1999": 8, "2004": 6, "2005": 5, "2012": 5, "2015": 5 }, "df": 7, "ts": 39 }, { "n": "Franz Boese", "b": 1885, "d": 1943, "s": "Historical School", "y": { "2006": 8, "2009": 5, "2021": 53 }, "df": 3, "ts": 66 }, { "n": "Alvin Harvey Hansen", "b": 1887, "d": 1975, "s": "Keynesian", "y": { "2004": 8, "2013": 5, "2014": 3, "2016": 5, "2017": 38, "2019": 3, "2021": 5, "2022": 8 }, "df": 8, "ts": 75 }, { "n": "Friedrich B\xFClow", "b": 1888, "d": 1962, "s": "Historical School", "y": { "2003": 13, "2008": 29, "2021": 5 }, "df": 3, "ts": 47 }, { "n": "Alexander Tschajanow", "b": 1888, "d": 1937, "s": "Other", "y": { "2003": 12 }, "df": 1, "ts": 12 }, { "n": "Gerhard Albrecht", "b": 1889, "d": 1969, "s": "Historical School", "y": { "2008": 3, "2009": 5, "2021": 15 }, "df": 3, "ts": 23 }, { "n": "Martin Heidegger", "b": 1889, "d": 1976, "s": "Philosophy", "y": { "2002": 3, "2005": 8, "2023": 8 }, "df": 3, "ts": 19 }, { "n": "Eduard Heimann", "b": 1889, "d": 1967, "s": "Other", "y": { "2001": 8, "2018": 5 }, "df": 2, "ts": 13 }, { "n": "Walter Eucken", "b": 1891, "d": 1950, "s": "Ordoliberalismus", "y": { "2003": 10, "2004": 73, "2007": 5, "2008": 5, "2009": 5, "2010": 78, "2011": 10, "2015": 10, "2016": 13, "2019": 51, "2021": 10, "2023": 58 }, "df": 12, "ts": 328 }, { "n": "Edgar Salin", "b": 1892, "d": 1974, "s": "Historical School", "y": { "1992": 3, "1999": 5, "2001": 16, "2003": 10, "2005": 45, "2006": 5, "2008": 11, "2017": 3, "2019": 3, "2021": 3 }, "df": 10, "ts": 104 }, { "n": "Adolph Lowe", "b": 1893, "d": 1995, "s": "Institutional", "y": { "1994": 5, "1998": 5, "2004": 3, "2010": 16, "2011": 3, "2019": 10 }, "df": 6, "ts": 42 }, { "n": "Andreas Pred\xF6hl", "b": 1893, "d": 1974, "s": "Raumwirtschaftslehre", "y": { "1987": 3, "2008": 51, "2019": 3 }, "df": 3, "ts": 57 }, { "n": "Walter Christaller", "b": 1893, "d": 1969, "s": "Raumwirtschaftslehre", "y": { "1987": 3, "2008": 63 }, "df": 2, "ts": 66 }, { "n": "Karl Mannheim", "b": 1893, "d": 1947, "s": "Other", "y": { "2001": 8, "2005": 5 }, "df": 2, "ts": 13 }, { "n": "Allan George Barnard Fisher", "b": 1895, "d": 1976, "s": "Development Economics", "y": { "1993": 8, "1997": 19, "2002": 5, "2011": 8, "2013": 8, "2015": 13, "2016": 27, "2019": 24 }, "df": 8, "ts": 112 }, { "n": "Franz B\xF6hm", "b": 1895, "d": 1977, "s": "Ordoliberalismus", "y": { "1994": 5, "2000": 5, "2004": 11, "2008": 8, "2013": 5, "2016": 8, "2023": 8 }, "df": 7, "ts": 50 }, { "n": "Hans Philipp Neisser", "b": 1895, "d": 1975, "s": "Austrian School", "y": { "1992": 78, "2002": 16, "2003": 9, "2005": 16, "2011": 3, "2019": 96 }, "df": 6, "ts": 218 }, { "n": "Ragnar Anton Kittil Frisch", "b": 1895, "d": 1973, "s": "Mathematical Economics", "y": { "1998": 15, "2002": 5, "2004": 11, "2007": 5, "2019": 8 }, "df": 5, "ts": 44 }, { "n": "Jakob Baxa", "b": 1895, "d": 1979, "s": "Historical School", "y": { "2001": 11, "2009": 8 }, "df": 2, "ts": 19 }, { "n": "Erich Gutenberg", "b": 1897, "d": 1984, "s": "Other", "y": { "2004": 48, "2008": 5, "2022": 5 }, "df": 3, "ts": 58 }, { "n": "Piero Sraffa", "b": 1898, "d": 1983, "s": "Post-Keynesian/Sraffian", "y": { "1993": 10, "1997": 11, "1998": 13, "2002": 11, "2003": 34, "2004": 6, "2007": 3, "2008": 3, "2010": 13, "2011": 8, "2013": 5, "2014": 8, "2015": 5, "2017": 16, "2022": 6 }, "df": 15, "ts": 152 }, { "n": "Gunnar Myrdal", "b": 1898, "d": 1987, "s": "Institutional", "y": { "1997": 5, "1998": 20, "2003": 3, "2004": 3, "2008": 14, "2010": 84, "2016": 10, "2023": 5 }, "df": 8, "ts": 144 }, { "n": "Howard Sylvester Ellis", "b": 1898, "d": 1992, "s": "Neoclassical", "y": { "1985": 3, "1999": 8, "2003": 11, "2011": 5, "2019": 24, "2023": 5 }, "df": 6, "ts": 56 }, { "n": "Jacob Marschak", "b": 1898, "d": 1977, "s": "Mathematical Economics", "y": { "2005": 13, "2011": 6, "2016": 8, "2019": 8 }, "df": 4, "ts": 35 }, { "n": "Friedrich August von Hayek", "b": 1899, "d": 1992, "s": "Austrian School", "y": { "1985": 3, "1998": 17, "1999": 8, "2000": 25, "2001": 11, "2002": 3, "2003": 24, "2004": 22, "2005": 28, "2007": 50, "2009": 11, "2010": 5, "2011": 22, "2012": 5, "2013": 5, "2014": 5, "2015": 5, "2016": 67, "2017": 56, "2019": 142, "2023": 27 }, "df": 21, "ts": 541 }, { "n": "Karl Brandt", "b": 1899, "d": 1975, "s": "Development Economics", "y": { "1993": 3, "1999": 5, "2001": 5, "2002": 5, "2005": 10, "2006": 5, "2010": 10, "2011": 5, "2018": 5, "2021": 10 }, "df": 10, "ts": 63 }, { "n": "Wilhelm R\xF6pke", "b": 1899, "d": 1966, "s": "Ordoliberalismus", "y": { "1992": 72, "1996": 8, "1997": 8, "2001": 3, "2004": 123, "2011": 21, "2016": 5, "2019": 8, "2023": 5 }, "df": 9, "ts": 253 }, { "n": "Bertil Gotthard Ohlin", "b": 1899, "d": 1979, "s": "Neoclassical", "y": { "1985": 6, "2008": 16, "2015": 8 }, "df": 3, "ts": 30 }, { "n": "Erich Egner", "b": 1899, "d": 1967, "s": "Historical School", "y": { "2008": 8, "2019": 8 }, "df": 2, "ts": 16 }, { "n": "Erich Carell", "b": 1899, "d": 1969, "s": "Neoclassical", "y": { "2003": 5, "2019": 5 }, "df": 2, "ts": 10 }, { "n": "Gottfried von Haberler", "b": 1900, "d": 1995, "s": "Austrian School", "y": { "1983": 5, "1985": 3, "2003": 5, "2004": 3, "2008": 5, "2011": 9, "2013": 8, "2017": 24, "2019": 26, "2023": 10 }, "df": 10, "ts": 98 }, { "n": "Erich Schneider", "b": 1900, "d": 1970, "s": "Neoclassical", "y": { "1985": 6, "1992": 6, "1996": 5, "2001": 6, "2003": 23, "2004": 143, "2011": 3, "2014": 8, "2015": 8, "2018": 3 }, "df": 10, "ts": 211 }, { "n": "Fritz Neumark", "b": 1900, "d": 1991, "s": "Other", "y": { "1992": 12, "2001": 8, "2004": 82, "2018": 5, "2019": 9, "2021": 3 }, "df": 6, "ts": 119 }, { "n": "Maurice Herbert Dobb", "b": 1900, "d": 1976, "s": "Marxist", "y": { "1994": 5, "1998": 5, "2010": 8, "2013": 5, "2018": 5 }, "df": 5, "ts": 28 }, { "n": "Friedrich August Lutz", "b": 1901, "d": 1975, "s": "Ordoliberalismus", "y": { "2004": 9, "2006": 5, "2011": 3, "2015": 26, "2019": 14, "2023": 58 }, "df": 6, "ts": 115 }, { "n": "Alfred M\xFCller-Armack", "b": 1901, "d": 1978, "s": "Ordoliberalismus", "y": { "1996": 5, "2000": 10, "2004": 3, "2011": 3 }, "df": 4, "ts": 21 }, { "n": "Simon Smith Kuznets", "b": 1901, "d": 1985, "s": "Development Economics", "y": { "2001": 16, "2011": 6, "2016": 8, "2019": 3 }, "df": 4, "ts": 33 }, { "n": "Oskar Morgenstern", "b": 1902, "d": 1977, "s": "Austrian School", "y": { "1992": 3, "2003": 13, "2005": 5, "2009": 3, "2011": 9, "2014": 3, "2019": 45, "2023": 5 }, "df": 8, "ts": 86 }, { "n": "Fritz Machlup", "b": 1902, "d": 1983, "s": "Austrian School", "y": { "2004": 6, "2005": 45, "2007": 11, "2011": 9, "2014": 3, "2017": 6, "2023": 5 }, "df": 7, "ts": 85 }, { "n": "Fritz Burchardt", "b": 1902, "d": 1958, "s": "Keynesian", "y": { "1994": 5, "2004": 3, "2010": 5, "2011": 13, "2019": 26 }, "df": 5, "ts": 52 }, { "n": "Karl Raimund Popper", "b": 1902, "d": 1994, "s": "Philosophy", "y": { "1998": 32, "1999": 5, "2001": 15 }, "df": 3, "ts": 52 }, { "n": "Joan Violet Robinson", "b": 1903, "d": 1983, "s": "Post-Keynesian/Sraffian", "y": { "1987": 3, "1992": 3, "1997": 5, "1998": 5, "2010": 21, "2012": 12, "2015": 5, "2017": 5, "2023": 9 }, "df": 9, "ts": 68 }, { "n": "Jan Tinbergen", "b": 1903, "d": 1994, "s": "Mathematical Economics", "y": { "1996": 8, "2003": 11, "2004": 3, "2007": 8, "2019": 3 }, "df": 5, "ts": 33 }, { "n": "Theodor Wiesengrund Adorno", "b": 1903, "d": 1969, "s": "Philosophy", "y": { "2009": 5, "2021": 5 }, "df": 2, "ts": 10 }, { "n": "John Richard Hicks", "b": 1904, "d": 1989, "s": "Neoclassical", "y": { "1989": 5, "1994": 8, "1997": 5, "1998": 5, "1999": 3, "2002": 10, "2003": 8, "2004": 5, "2010": 23, "2013": 11, "2015": 13, "2017": 8, "2019": 18 }, "df": 13, "ts": 122 }, { "n": "Wilhelm Abel", "b": 1904, "d": 1985, "s": "Historical School", "y": { "2001": 8, "2003": 11, "2004": 8, "2006": 8, "2016": 8 }, "df": 5, "ts": 43 }, { "n": "Alexander Gerschenkron", "b": 1904, "d": 1978, "s": "Development Economics", "y": { "1999": 5, "2003": 5, "2019": 8 }, "df": 3, "ts": 18 }, { "n": "Colin Clark", "b": 1905, "d": 1989, "s": "Development Economics", "y": { "1993": 8, "1994": 3, "1999": 3, "2001": 11, "2003": 3, "2009": 5, "2011": 29, "2012": 15, "2013": 8, "2016": 16, "2022": 3 }, "df": 11, "ts": 104 }, { "n": "Heinrich von Stackelberg", "b": 1905, "d": 1946, "s": "Mathematical Economics", "y": { "2003": 46, "2004": 9, "2015": 5, "2017": 3 }, "df": 4, "ts": 63 }, { "n": "Roy George Douglas Allen", "b": 1906, "d": 1983, "s": "Mathematical Economics", "y": { "2001": 5, "2007": 5, "2008": 3, "2010": 8, "2014": 5, "2016": 25, "2023": 5 }, "df": 7, "ts": 56 }, { "n": "August L\xF6sch", "b": 1906, "d": 1945, "s": "Raumwirtschaftslehre", "y": { "1987": 3, "2008": 44, "2014": 30, "2017": 14, "2019": 30 }, "df": 5, "ts": 121 }, { "n": "Wassily Leontief", "b": 1906, "d": 1999, "s": "Mathematical Economics", "y": { "1994": 5, "2002": 10, "2011": 6 }, "df": 3, "ts": 21 }, { "n": "Hannah Arendt", "b": 1906, "d": 1975, "s": "Philosophy", "y": { "2006": 3, "2013": 5, "2015": 5 }, "df": 3, "ts": 13 }, { "n": "Jean Fourasti\xE9", "b": 1907, "d": 1990, "s": "Development Economics", "y": { "1999": 5, "2013": 11, "2016": 5 }, "df": 3, "ts": 21 }, { "n": "Nicholas Kaldor", "b": 1908, "d": 1986, "s": "Post-Keynesian/Sraffian", "y": { "1997": 5, "2002": 13, "2008": 8, "2009": 5, "2010": 8, "2015": 11, "2023": 3 }, "df": 7, "ts": 53 }, { "n": "John Kenneth Galbraith", "b": 1908, "d": 2006, "s": "Institutional", "y": { "2001": 5, "2011": 10 }, "df": 2, "ts": 15 }, { "n": "Werner Stark", "b": 1909, "d": 1985, "s": "Historical School", "y": { "1998": 6, "2001": 11, "2018": 5 }, "df": 3, "ts": 22 }, { "n": "Charles Poor Kindleberger", "b": 1910, "d": 2003, "s": "Development Economics", "y": { "2007": 5, "2011": 5, "2017": 8, "2018": 5, "2019": 8, "2021": 5 }, "df": 6, "ts": 36 }, { "n": "Richard Abel Musgrave", "b": 1910, "d": 2007, "s": "Other", "y": { "1985": 3, "1992": 12, "1997": 5, "1998": 29, "2005": 5, "2011": 9 }, "df": 6, "ts": 63 }, { "n": "Kenneth Ewart Boulding", "b": 1910, "d": 1993, "s": "Institutional", "y": { "2004": 3, "2005": 8, "2022": 5 }, "df": 3, "ts": 16 }, { "n": "Walter Adolf J\xF6hr", "b": 1910, "d": 1991, "s": "Neoclassical", "y": { "2019": 5, "2021": 8 }, "df": 2, "ts": 13 }, { "n": "George Joseph Stigler", "b": 1911, "d": 1991, "s": "Neoclassical", "y": { "1997": 13, "2000": 5, "2002": 16, "2011": 5 }, "df": 4, "ts": 39 }, { "n": "Georg Peter Landmann", "b": 1911, "d": 1994, "s": "Philosophy", "y": { "1992": 24, "2004": 5, "2005": 22, "2021": 10 }, "df": 4, "ts": 61 }, { "n": "Marian Bowley", "b": 1911, "d": 1994, "s": "Contemporary", "y": { "1989": 15, "2002": 5 }, "df": 2, "ts": 20 }, { "n": "Otmar Emminger", "b": 1911, "d": 1986, "s": "Other", "y": { "2004": 10, "2011": 5 }, "df": 2, "ts": 15 }, { "n": "Milton Friedman", "b": 1912, "d": 2006, "s": "Neoclassical", "y": { "1983": 15, "1999": 8, "2001": 8, "2004": 6, "2005": 16, "2007": 15, "2011": 60, "2013": 5, "2016": 13, "2017": 8, "2019": 13 }, "df": 11, "ts": 167 }, { "n": "Terence Wilmot Hutchison", "b": 1912, "d": 2007, "s": "Philosophy", "y": { "1983": 8, "2001": 6, "2004": 3, "2005": 8, "2007": 5, "2018": 5, "2021": 5 }, "df": 7, "ts": 40 }, { "n": "John Richard Nicholas Stone", "b": 1913, "d": 1991, "s": "Mathematical Economics", "y": { "2007": 3, "2011": 11, "2012": 14 }, "df": 3, "ts": 28 }, { "n": "Lewis A. Coser", "b": 1913, "d": 2003, "s": "Other", "y": { "2004": 8, "2011": 8 }, "df": 2, "ts": 16 }, { "n": "Paul Anthony Samuelson", "b": 1915, "d": 2009, "s": "Neoclassical", "y": { "1980": 8, "1985": 6, "1994": 3, "1997": 10, "1999": 3, "2000": 10, "2001": 16, "2002": 15, "2004": 8, "2007": 14, "2008": 22, "2010": 8, "2011": 11, "2013": 8, "2015": 19, "2016": 13, "2017": 5, "2019": 21, "2022": 16, "2023": 3 }, "df": 20, "ts": 219 }, { "n": "Albert Otto Hirschman", "b": 1915, "d": 2012, "s": "Development Economics", "y": { "2010": 18, "2011": 3, "2018": 21, "2021": 8, "2022": 5, "2023": 5 }, "df": 6, "ts": 60 }, { "n": "Hans Brems", "b": 1915, "d": 2e3, "s": "Mathematical Economics", "y": { "2000": 5, "2002": 8, "2004": 8 }, "df": 3, "ts": 21 }, { "n": "Herbert Alexander Simon", "b": 1916, "d": 2001, "s": "Institutional", "y": { "1998": 6, "2007": 5, "2011": 3, "2012": 5, "2018": 3, "2019": 9, "2021": 3 }, "df": 7, "ts": 34 }, { "n": "Wilhelm Krelle", "b": 1916, "d": 2004, "s": "Mathematical Economics", "y": { "1993": 3, "2004": 5, "2008": 5, "2015": 8, "2021": 8 }, "df": 5, "ts": 29 }, { "n": "Robert Dorfman", "b": 1916, "d": 2002, "s": "Mathematical Economics", "y": { "2003": 8, "2008": 8, "2011": 23, "2016": 8, "2022": 8 }, "df": 5, "ts": 55 }, { "n": "Karl Brunner", "b": 1916, "d": 1989, "s": "Neoclassical", "y": { "2004": 10, "2011": 40, "2018": 8, "2021": 5 }, "df": 4, "ts": 63 }, { "n": "J\xFCrg Niehans", "b": 1919, "d": 2007, "s": "Neoclassical", "y": { "1993": 3, "1994": 3, "2001": 8, "2003": 5, "2004": 8, "2008": 10, "2010": 8, "2011": 6, "2019": 3, "2021": 8 }, "df": 10, "ts": 62 }, { "n": "James McGill Buchanan", "b": 1919, "d": 2013, "s": "Institutional", "y": { "1992": 6, "1997": 11, "1998": 13, "2001": 8, "2004": 8, "2005": 8, "2007": 5, "2014": 13, "2016": 8, "2022": 13 }, "df": 10, "ts": 93 }, { "n": "Karl H\xE4user", "b": 1920, "d": 1995, "s": "Historical School", "y": { "1990": 3, "1996": 8, "1998": 6, "1999": 20, "2003": 16, "2004": 28, "2005": 8, "2007": 5 }, "df": 8, "ts": 94 }, { "n": "Kenneth Joseph Arrow", "b": 1921, "d": 2017, "s": "Neoclassical", "y": { "2002": 8, "2005": 43, "2007": 8, "2012": 5, "2016": 13 }, "df": 5, "ts": 77 }, { "n": "Herbert Giersch", "b": 1921, "d": 2010, "s": "Neoclassical", "y": { "2002": 5, "2004": 26, "2008": 5, "2021": 3 }, "df": 4, "ts": 39 }, { "n": "John Rawls", "b": 1921, "d": 2002, "s": "Philosophy", "y": { "1998": 5, "2016": 10 }, "df": 2, "ts": 15 }, { "n": "William Jack Baumol", "b": 1922, "d": 2017, "s": "Neoclassical", "y": { "1980": 5, "1992": 3, "1998": 5, "2007": 5, "2011": 5, "2013": 16, "2014": 16, "2016": 5, "2017": 5 }, "df": 9, "ts": 65 }, { "n": "Don Patinkin", "b": 1922, "d": 1995, "s": "Keynesian", "y": { "1983": 3, "1997": 11, "1998": 5, "2007": 11, "2014": 3, "2019": 122, "2023": 8 }, "df": 7, "ts": 163 }, { "n": "Alfred B\xFCrgin", "b": 1922, "d": 2009, "s": "Historical School", "y": { "2001": 16, "2004": 8, "2006": 5, "2018": 21 }, "df": 4, "ts": 50 }, { "n": "Thomas Samuel Kuhn", "b": 1922, "d": 1996, "s": "Philosophy", "y": { "1994": 3, "2001": 3, "2012": 5, "2016": 13 }, "df": 4, "ts": 24 }, { "n": "Michio Morishima", "b": 1923, "d": 2004, "s": "Mathematical Economics", "y": { "1993": 5, "2000": 8, "2005": 8, "2009": 3 }, "df": 4, "ts": 24 }, { "n": "Harry Gordon Johnson", "b": 1923, "d": 1977, "s": "Neoclassical", "y": { "1998": 8, "2011": 19, "2015": 5 }, "df": 3, "ts": 32 }, { "n": "Mark Perlman", "b": 1923, "d": 2006, "s": "Institutional", "y": { "2001": 19, "2011": 16 }, "df": 2, "ts": 35 }, { "n": "Wilhelm Hennis", "b": 1923, "d": 2012, "s": "Other", "y": { "2009": 8, "2015": 8 }, "df": 2, "ts": 16 }, { "n": "Reinhart Koselleck", "b": 1923, "d": 2006, "s": "Other", "y": { "2012": 13, "2018": 5 }, "df": 2, "ts": 18 }, { "n": "Ernst Helmst\xE4dter", "b": 1924, "d": 2009, "s": "Evolutionary", "y": { "2001": 25, "2003": 5, "2005": 11, "2008": 3, "2010": 8, "2011": 5, "2019": 3, "2021": 8, "2022": 14 }, "df": 9, "ts": 82 }, { "n": "Robert Merton Solow", "b": 1924, "d": 2023, "s": "Neoclassical", "y": { "1998": 3, "2005": 6, "2007": 3, "2010": 6, "2011": 6, "2014": 3, "2015": 6, "2016": 14, "2017": 13 }, "df": 9, "ts": 60 }, { "n": "David Saul Landes", "b": 1924, "d": 2013, "s": "Historical School", "y": { "2000": 13, "2005": 8, "2012": 15, "2018": 5 }, "df": 4, "ts": 41 }, { "n": "Knut Borchardt", "b": 1926, "d": 2019, "s": "Historical School", "y": { "2004": 19, "2008": 5, "2011": 10, "2012": 5, "2015": 8, "2019": 5, "2021": 18 }, "df": 7, "ts": 70 }, { "n": "John Somerset Chipman", "b": 1926, "d": 2022, "s": "Mathematical Economics", "y": { "1999": 5, "2003": 5, "2005": 5, "2010": 16, "2018": 8 }, "df": 5, "ts": 39 }, { "n": "Rudolf Richter", "b": 1926, "d": 2021, "s": "Institutional", "y": { "1998": 11, "2004": 19, "2011": 6, "2012": 5, "2015": 5 }, "df": 5, "ts": 46 }, { "n": "Mark Blaug", "b": 1927, "d": 2011, "s": "Contemporary", "y": { "1980": 5, "1992": 3, "1994": 3, "1997": 10, "1998": 23, "2000": 5, "2001": 44, "2002": 5, "2003": 5, "2005": 5, "2007": 5, "2008": 10, "2011": 5, "2013": 5, "2014": 34, "2015": 10, "2017": 5, "2022": 13 }, "df": 18, "ts": 195 }, { "n": "Niklas Luhmann", "b": 1927, "d": 1998, "s": "Other", "y": { "2008": 5, "2016": 8, "2018": 10 }, "df": 3, "ts": 23 }, { "n": "Eckart Schremmer", "b": 1927, "d": 2013, "s": "Historical School", "y": { "2004": 8, "2006": 5 }, "df": 2, "ts": 13 }, { "n": "Harald Winkel", "b": 1928, "d": 1995, "s": "Historical School", "y": { "1982": 3, "1990": 3, "2001": 3, "2002": 10, "2003": 8, "2005": 5, "2015": 9, "2021": 3 }, "df": 8, "ts": 44 }, { "n": "Erwin Weissel", "b": 1928, "d": 2008, "s": "Marxist", "y": { "2009": 8, "2023": 5 }, "df": 2, "ts": 13 }, { "n": "Peter Bernholz", "b": 1929, "d": 2023, "s": "Neoclassical", "y": { "1985": 3, "2003": 5, "2004": 5, "2015": 5 }, "df": 4, "ts": 18 }, { "n": "Hans Christoph Binswanger", "b": 1929, "d": 2018, "s": "Other", "y": { "1998": 3, "2002": 5, "2015": 5, "2018": 18 }, "df": 4, "ts": 31 }, { "n": "Robert V. Eagly", "b": 1929, "d": 1995, "s": "Historical School", "y": { "1982": 3, "2003": 5, "2018": 5 }, "df": 3, "ts": 13 }, { "n": "Edwin von B\xF6venter", "b": 1929, "d": 2e3, "s": "Raumwirtschaftslehre", "y": { "2006": 5, "2008": 8, "2014": 8 }, "df": 3, "ts": 21 }, { "n": "J\xFCrgen Habermas", "b": 1929, "d": null, "s": "Philosophy", "y": { "2000": 8, "2005": 5 }, "df": 2, "ts": 13 }, { "n": "Israel Meir Kirzner", "b": 1930, "d": null, "s": "Austrian School", "y": { "1997": 5, "2004": 3, "2005": 5, "2007": 6, "2011": 5 }, "df": 5, "ts": 24 }, { "n": "Luigi Lodovico Pasinetti", "b": 1930, "d": 2023, "s": "Post-Keynesian/Sraffian", "y": { "1998": 8, "2002": 5, "2010": 11, "2014": 19, "2015": 5 }, "df": 5, "ts": 48 }, { "n": "Pierangelo Garegnani", "b": 1930, "d": 2011, "s": "Post-Keynesian/Sraffian", "y": { "1997": 5, "1998": 8, "2013": 5, "2017": 8, "2023": 3 }, "df": 5, "ts": 29 }, { "n": "Paul Davidson", "b": 1930, "d": 2022, "s": "Post-Keynesian/Sraffian", "y": { "2004": 5, "2007": 5, "2011": 5, "2019": 8 }, "df": 4, "ts": 23 }, { "n": "Karl Heinrich Kaufhold", "b": 1931, "d": 2016, "s": "Historical School", "y": { "2006": 15, "2012": 10, "2021": 10 }, "df": 3, "ts": 35 }, { "n": "Erich Wolfgang Streissler", "b": 1933, "d": 2019, "s": "Austrian School", "y": { "1993": 3, "1995": 45, "1997": 5, "1999": 11, "2000": 5, "2005": 5, "2006": 3, "2010": 5, "2011": 17, "2012": 5, "2013": 8, "2021": 3 }, "df": 12, "ts": 115 }, { "n": "Axel Leijonhufvud", "b": 1933, "d": 2022, "s": "Keynesian", "y": { "1983": 14, "1997": 13, "2003": 3, "2004": 18, "2011": 6, "2015": 8, "2016": 8, "2019": 8 }, "df": 8, "ts": 78 }, { "n": "Takashi Negishi", "b": 1933, "d": null, "s": "Neoclassical", "y": { "1997": 3, "2001": 8, "2006": 5, "2008": 8 }, "df": 4, "ts": 24 }, { "n": "Hajo Riese", "b": 1934, "d": 2015, "s": "Post-Keynesian/Sraffian", "y": { "1983": 3, "1998": 5, "2004": 39, "2016": 8, "2019": 5 }, "df": 5, "ts": 60 }, { "n": "Knut Wolfgang N\xF6rr", "b": 1935, "d": null, "s": "Ordoliberalismus", "y": { "2009": 8, "2023": 5 }, "df": 2, "ts": 13 }, { "n": "Robert Emerson Lucas Jr.", "b": 1937, "d": 2023, "s": "Neoclassical", "y": { "2004": 8, "2005": 22, "2010": 8, "2011": 8, "2016": 8, "2017": 8, "2019": 3, "2022": 3 }, "df": 8, "ts": 68 }, { "n": "Klaus Hinrich Hennings", "b": 1937, "d": 1986, "s": "Austrian School", "y": { "1995": 9, "1999": 3, "2001": 5, "2004": 18, "2013": 5, "2015": 10 }, "df": 6, "ts": 50 }, { "n": "David Ernest William Laidler", "b": 1938, "d": null, "s": "Keynesian", "y": { "1983": 8, "1997": 17, "1998": 10, "1999": 8, "2011": 12, "2017": 5, "2019": 8 }, "df": 7, "ts": 68 }, { "n": "Peter Groenewegen", "b": 1939, "d": 2016, "s": "Contemporary", "y": { "1993": 5, "1994": 3, "2016": 8, "2019": 8 }, "df": 4, "ts": 24 }, { "n": "Peter Kalmbach", "b": 1939, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "2011": 3, "2013": 5, "2015": 14 }, "df": 3, "ts": 22 }, { "n": "Christopher Jonathan Bliss", "b": 1940, "d": null, "s": "Neoclassical", "y": { "2007": 5, "2015": 5 }, "df": 2, "ts": 10 }, { "n": "Michael Ruse", "b": 1940, "d": null, "s": "Philosophy", "y": { "2005": 5, "2022": 8 }, "df": 2, "ts": 13 }, { "n": "Ian Steedman", "b": 1941, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "1997": 8, "2003": 5, "2005": 5, "2010": 9 }, "df": 4, "ts": 27 }, { "n": "Filippo Cesarano", "b": 1942, "d": null, "s": "Contemporary", "y": { "1998": 8, "2001": 8 }, "df": 2, "ts": 16 }, { "n": "Joseph Eugene Stiglitz", "b": 1943, "d": null, "s": "Contemporary", "y": { "2004": 8, "2005": 3, "2007": 3, "2008": 3, "2010": 3, "2012": 5, "2015": 3, "2016": 3 }, "df": 8, "ts": 31 }, { "n": "Eliot Roy Weintraub", "b": 1943, "d": null, "s": "Contemporary", "y": { "2001": 8, "2002": 5, "2005": 3, "2006": 5 }, "df": 4, "ts": 21 }, { "n": "Michael Hutter", "b": 1943, "d": null, "s": "Institutional", "y": { "2018": 8, "2022": 5 }, "df": 2, "ts": 13 }, { "n": "Jan Allen Kregel", "b": 1944, "d": null, "s": "Post-Keynesian/Sraffian", "y": { "2004": 13, "2017": 5, "2022": 5 }, "df": 3, "ts": 23 }, { "n": "Sergio Cremaschi", "b": 1945, "d": null, "s": "Philosophy", "y": { "2014": 5, "2016": 5, "2022": 9 }, "df": 3, "ts": 19 }, { "n": "Geoffrey Martin Hodgson", "b": 1946, "d": null, "s": "Institutional", "y": { "2012": 13, "2016": 63, "2021": 13, "2023": 3 }, "df": 4, "ts": 92 }, { "n": "Joel Mokyr", "b": 1946, "d": null, "s": "Evolutionary", "y": { "2012": 31, "2016": 5, "2017": 11 }, "df": 3, "ts": 47 }, { "n": "Anthony Brewer", "b": 1946, "d": null, "s": "Contemporary", "y": { "2008": 8, "2018": 8 }, "df": 2, "ts": 16 }, { "n": "Istv\xE1n Hont", "b": 1947, "d": 2013, "s": "Historical School", "y": { "2003": 5, "2018": 18, "2022": 11 }, "df": 3, "ts": 34 }, { "n": "Joel Kaye", "b": 1947, "d": null, "s": "Other", "y": { "2000": 14, "2003": 8 }, "df": 2, "ts": 22 }, { "n": "Richard Swedberg", "b": 1948, "d": null, "s": "Institutional", "y": { "2001": 8, "2012": 5, "2015": 3, "2016": 5 }, "df": 4, "ts": 21 }, { "n": "Stefan Breuer", "b": 1948, "d": null, "s": "Other", "y": { "2005": 8, "2008": 8 }, "df": 2, "ts": 16 }, { "n": "Keith Tribe", "b": 1949, "d": null, "s": "Historical School", "y": { "1994": 6, "2003": 8, "2006": 3, "2011": 3, "2014": 3, "2015": 3, "2018": 8, "2019": 3, "2021": 3 }, "df": 9, "ts": 40 }, { "n": "J\xFCrgen Georg Backhaus", "b": 1950, "d": null, "s": "Institutional", "y": { "1996": 5, "2001": 14, "2003": 8, "2007": 5, "2014": 10, "2016": 5, "2021": 15, "2023": 3 }, "df": 8, "ts": 65 }, { "n": "Ulrich van Suntum", "b": 1950, "d": null, "s": "Ordoliberalismus", "y": { "1993": 6, "2008": 5, "2015": 8, "2022": 9 }, "df": 4, "ts": 28 }, { "n": "Don Lavoie", "b": 1951, "d": 2001, "s": "Austrian School", "y": { "2005": 5, "2007": 12, "2011": 8, "2023": 5 }, "df": 4, "ts": 30 }, { "n": "Uskali M\xE4ki", "b": 1951, "d": null, "s": "Philosophy", "y": { "2001": 3, "2005": 5, "2008": 8 }, "df": 3, "ts": 16 }, { "n": "Paul Robin Krugman", "b": 1953, "d": null, "s": "Raumwirtschaftslehre", "y": { "2007": 11, "2008": 75, "2010": 89, "2011": 6, "2014": 6, "2017": 19, "2018": 5, "2019": 8 }, "df": 8, "ts": 219 }, { "n": "Christos Baloglou", "b": 1954, "d": null, "s": "Other", "y": { "1999": 8, "2002": 8 }, "df": 2, "ts": 16 }, { "n": "John Geanakoplos", "b": 1955, "d": null, "s": "Mathematical Economics", "y": { "2005": 8, "2007": 5 }, "df": 2, "ts": 13 }, { "n": "Bradley W. Bateman", "b": 1956, "d": null, "s": "Keynesian", "y": { "2007": 8, "2011": 5 }, "df": 2, "ts": 13 }, { "n": "Daniele Besomi", "b": 1963, "d": null, "s": "Contemporary", "y": { "2001": 3, "2013": 8, "2019": 5 }, "df": 3, "ts": 16 }, { "n": "Nicolai Juul Foss", "b": 1964, "d": null, "s": "Evolutionary", "y": { "2002": 8, "2007": 16 }, "df": 2, "ts": 24 }, { "n": "Charles I. Jones", "b": 1968, "d": null, "s": "Contemporary", "y": { "1998": 3, "2000": 5, "2001": 3, "2005": 11, "2012": 5, "2017": 8 }, "df": 6, "ts": 35 }, { "n": "Hans J\xF6rg Hennecke", "b": 1968, "d": null, "s": "Contemporary", "y": { "2016": 5, "2021": 5 }, "df": 2, "ts": 10 }];
var SC = {
  "Cameralism": "#8B4513",
  "Classical": "#2196F3",
  "Historical School": "#FF9800",
  "National Economy": "#795548",
  "Marxist": "#F44336",
  "Austrian School": "#CE93D8",
  "Keynesian": "#4CAF50",
  "Post-Keynesian/Sraffian": "#00BCD4",
  "Evolutionary": "#E91E63",
  "Ordoliberalismus": "#80CBC4",
  "Raumwirtschaftslehre": "#B39DDB",
  "Neoclassical": "#90CAF9",
  "Mathematical Economics": "#B0BEC5",
  "Institutional": "#FF8A65",
  "Development Economics": "#D4E157",
  "Contemporary": "#78909C",
  "Philosophy": "#EEEEEE",
  "Other": "#757575"
};
var ERAS = [
  { lo: 1550, hi: 1650, label: "Pre-Classical", bg: "rgba(255,255,255,0.03)" },
  { lo: 1650, hi: 1750, label: "Mercantilist", bg: "rgba(255,193,7,0.07)" },
  { lo: 1750, hi: 1820, label: "Classical I", bg: "rgba(33,150,243,0.07)" },
  { lo: 1820, hi: 1870, label: "Classical II & Hist. School", bg: "rgba(76,175,80,0.07)" },
  { lo: 1870, hi: 1910, label: "Marginalist / Austrian", bg: "rgba(156,39,176,0.09)" },
  { lo: 1910, hi: 1940, label: "Keynesian Generation", bg: "rgba(0,188,212,0.07)" },
  { lo: 1940, hi: 1960, label: "Post-War", bg: "rgba(233,30,99,0.06)" },
  { lo: 1960, hi: 2e3, label: "Contemporary", bg: "rgba(121,85,72,0.06)" }
];
var CONF_BY_YEAR = Object.fromEntries(CONFS.map((c) => [c.year, c]));
var ALL_YEARS = CONFS.map((c) => c.year);
var shortName = (n) => {
  const parts = n.split(" ");
  if (parts.length <= 2) return n;
  const last = parts[parts.length - 1];
  const parti = ["von", "van", "de", "di", "le"].includes(parts[parts.length - 2].toLowerCase()) ? parts[parts.length - 2] + " " + last : last;
  return parts[0][0] + ". " + parti;
};
function useLang() {
  const [de, setDe] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.AGW)
        return window.AGW.getLang() === "de";
      return (localStorage.getItem("agw-lang") || "de") === "de";
    } catch (e) {
      return true;
    }
  });
  useEffect(() => {
    const handler = (e) => setDe((e?.detail || "de") === "de");
    window.addEventListener("agw-lang-change", handler);
    return () => window.removeEventListener("agw-lang-change", handler);
  }, []);
  return { de, t: (en, deStr) => de && deStr ? deStr : en };
}
function AGWGazeMap() {
  const lang = useLang();
  const [view, setView] = useState("map");
  const [hovFig, setHovFig] = useState(null);
  const [hovConf, setHovConf] = useState(null);
  const [selSchool, setSelSchool] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const schools = useMemo(() => [...new Set(FIGS_ALL.map((f) => f.s))].sort(), []);
  return /* @__PURE__ */ jsxs("div", { style: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "#0a0e1a",
    color: "#c8c8d8",
    minHeight: "100vh",
    padding: "0 0 40px 0"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "24px 32px 0",
      borderBottom: "1px solid rgba(200,200,216,0.15)",
      marginBottom: "0"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 11,
        letterSpacing: "0.2em",
        color: "#6a7090",
        textTransform: "uppercase",
        marginBottom: 4
      }, children: [
        lang.t("Committee for the History of Economic Thought", "Ausschuss f\xFCr die Geschichte der Wirtschaftswissenschaften"),
        " \xB7 1980\u20132023"
      ] }),
      /* @__PURE__ */ jsx("h1", { style: {
        margin: "0 0 4px",
        fontSize: 22,
        fontWeight: "normal",
        letterSpacing: "0.05em",
        color: "#e8e8f0"
      }, children: lang.t("Intellectual Gaze", "Intellektueller Blick") }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#6a7090", marginBottom: 16 }, children: lang.t("Who did 43 conferences study? Dot size = citation intensity \xB7 Colour = school of thought", "Wen haben 43 Konferenzen studiert? Punktgr\xF6\xDFe = Zitierintensit\xE4t \xB7 Farbe = Denkschule") }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 0 }, children: [["map", lang.t("Gaze Map", "Karte")], ["era", lang.t("By Era", "Nach Epoche")], ["top", lang.t("Top Figures", "Top-Figuren")]].map(([v, label]) => /* @__PURE__ */ jsx("button", { onClick: () => setView(v), style: {
        padding: "8px 20px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 12,
        letterSpacing: "0.08em",
        background: view === v ? "rgba(200,200,216,0.12)" : "transparent",
        color: view === v ? "#e8e8f0" : "#6a7090",
        borderBottom: view === v ? "2px solid #90CAF9" : "2px solid transparent",
        transition: "all 0.15s"
      }, children: label }, v)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px 16px",
      padding: "12px 32px",
      borderBottom: "1px solid rgba(200,200,216,0.08)"
    }, children: [
      schools.map((s) => /* @__PURE__ */ jsxs(
        "span",
        {
          onClick: () => setSelSchool(selSchool === s ? null : s),
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            letterSpacing: "0.06em",
            cursor: "pointer",
            opacity: selSchool && selSchool !== s ? 0.3 : 1,
            transition: "opacity 0.15s"
          },
          children: [
            /* @__PURE__ */ jsx("span", { style: {
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: SC[s] || "#888",
              flexShrink: 0
            } }),
            s
          ]
        },
        s
      )),
      selSchool && /* @__PURE__ */ jsx("span", { onClick: () => setSelSchool(null), style: {
        fontSize: 10,
        cursor: "pointer",
        color: "#90CAF9",
        textDecoration: "underline"
      }, children: "clear" })
    ] }),
    view === "map" && /* @__PURE__ */ jsx(
      GazeMapView,
      {
        hovFig,
        setHovFig,
        hovConf,
        setHovConf,
        selSchool
      }
    ),
    view === "era" && /* @__PURE__ */ jsx(EraView, { selSchool }),
    view === "top" && /* @__PURE__ */ jsx(TopFigView, { selSchool })
  ] });
}
function GazeMapView({ hovFig, setHovFig, hovConf, setHovConf, selSchool }) {
  const [tooltip, setTooltip] = useState(null);
  const LEFT = 140, RIGHT = 24;
  const TOP = 16, BOTTOM = 72;
  const COL_W = 15;
  const ROW_H = 7;
  const svgW = LEFT + ALL_YEARS.length * COL_W + RIGHT;
  const svgH = TOP + FIGS.length * ROW_H + BOTTOM;
  const xOf = (yr) => LEFT + ALL_YEARS.indexOf(yr) * COL_W + COL_W / 2;
  const yOf = (i) => TOP + i * ROW_H + ROW_H / 2;
  const maxScore = useMemo(
    () => Math.max(...FIGS.flatMap((f) => Object.values(f.y))),
    []
  );
  const rOf = (score) => Math.max(1.8, Math.sqrt(score / maxScore) * 5.5);
  const onDot = useCallback((e, fig, yr, score) => {
    const conf = CONF_BY_YEAR[yr] || {};
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      fig: fig.n,
      birth: fig.b,
      school: fig.s,
      year: yr,
      score,
      theme: conf.theme || ""
    });
    setHovFig(fig.n);
    setHovConf(yr);
  }, [setHovFig, setHovConf]);
  const onLeave = useCallback(() => {
    setTooltip(null);
    setHovFig(null);
    setHovConf(null);
  }, [setHovFig, setHovConf]);
  return /* @__PURE__ */ jsxs("div", { style: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 160px)",
    padding: "0 0 0 0"
  }, children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        width: svgW,
        height: svgH,
        style: { display: "block", fontFamily: "'Georgia',serif" },
        children: [
          ERAS.map((era) => {
            const figI0 = FIGS.findIndex((f) => f.b >= era.lo);
            const figI1 = FIGS.findLastIndex((f) => era.hi ? f.b < era.hi : true);
            if (figI0 < 0 || figI1 < figI0) return null;
            const y0 = TOP + figI0 * ROW_H;
            const y1 = TOP + (figI1 + 1) * ROW_H;
            return /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx(
                "rect",
                {
                  x: 0,
                  y: y0,
                  width: svgW,
                  height: y1 - y0,
                  fill: era.bg
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: 4,
                  y: y0 + 10,
                  fontSize: 8,
                  fill: "rgba(200,200,216,0.25)",
                  fontStyle: "italic",
                  children: era.label
                }
              )
            ] }, era.label);
          }),
          ALL_YEARS.map((yr, i) => /* @__PURE__ */ jsx(
            "line",
            {
              x1: xOf(yr),
              y1: TOP,
              x2: xOf(yr),
              y2: TOP + FIGS.length * ROW_H,
              stroke: hovConf === yr ? "rgba(144,202,249,0.4)" : "rgba(200,200,216,0.07)",
              strokeWidth: hovConf === yr ? 2 : 0.5
            },
            yr
          )),
          FIGS.map((fig, i) => /* @__PURE__ */ jsx(
            "line",
            {
              x1: LEFT,
              y1: yOf(i),
              x2: LEFT + ALL_YEARS.length * COL_W,
              y2: yOf(i),
              stroke: hovFig === fig.n ? "rgba(144,202,249,0.25)" : "rgba(200,200,216,0.04)",
              strokeWidth: hovFig === fig.n ? 1.5 : 0.5
            },
            fig.n
          )),
          FIGS.map((fig, i) => {
            const active = !selSchool || selSchool === fig.s;
            const col = SC[fig.s] || "#888";
            return /* @__PURE__ */ jsx("g", { children: Object.entries(fig.y).map(([yr_s, score]) => {
              const yr = parseInt(yr_s);
              const x = xOf(yr), y = yOf(i);
              const r = rOf(score);
              const hilite = hovFig === fig.n || hovConf === yr;
              return /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: x,
                  cy: y,
                  r,
                  fill: col,
                  opacity: active ? hilite ? 0.95 : 0.65 : 0.07,
                  onMouseEnter: (e) => onDot(e, fig, yr, score),
                  onMouseLeave: onLeave,
                  style: { cursor: "pointer", transition: "opacity 0.1s" }
                },
                yr
              );
            }) }, fig.n);
          }),
          FIGS.map((fig, i) => {
            const active = !selSchool || selSchool === fig.s;
            const hilite = hovFig === fig.n;
            return /* @__PURE__ */ jsx(
              "text",
              {
                x: LEFT - 5,
                y: yOf(i) + 2.5,
                textAnchor: "end",
                fontSize: hilite ? 7.5 : 6.5,
                fill: active ? hilite ? "#e8e8f0" : SC[fig.s] || "#888" : "rgba(200,200,216,0.15)",
                fontWeight: hilite ? "bold" : "normal",
                style: { cursor: "default", transition: "all 0.1s" },
                onMouseEnter: () => setHovFig(fig.n),
                onMouseLeave: () => setHovFig(null),
                children: shortName(fig.n)
              },
              fig.n
            );
          }),
          ALL_YEARS.map((yr, i) => {
            const show5 = yr % 5 === 0;
            const conf = CONF_BY_YEAR[yr] || {};
            return /* @__PURE__ */ jsxs(
              "g",
              {
                onMouseEnter: () => setHovConf(yr),
                onMouseLeave: () => setHovConf(null),
                style: { cursor: "default" },
                children: [
                  /* @__PURE__ */ jsx(
                    "line",
                    {
                      x1: xOf(yr),
                      y1: TOP + FIGS.length * ROW_H,
                      x2: xOf(yr),
                      y2: TOP + FIGS.length * ROW_H + 4,
                      stroke: "rgba(200,200,216,0.3)",
                      strokeWidth: 0.5
                    }
                  ),
                  show5 && /* @__PURE__ */ jsx(
                    "text",
                    {
                      x: xOf(yr),
                      y: TOP + FIGS.length * ROW_H + 12,
                      textAnchor: "middle",
                      fontSize: 7,
                      fill: hovConf === yr ? "#90CAF9" : "rgba(200,200,216,0.5)",
                      fontWeight: hovConf === yr ? "bold" : "normal",
                      children: yr
                    }
                  ),
                  hovConf === yr && /* @__PURE__ */ jsx(
                    "text",
                    {
                      x: xOf(yr),
                      y: TOP + FIGS.length * ROW_H + 26,
                      textAnchor: "middle",
                      fontSize: 6.5,
                      fill: "#90CAF9",
                      fontStyle: "italic",
                      style: { pointerEvents: "none" },
                      children: (conf.theme || "").length > 30 ? conf.theme.slice(0, 28) + "\u2026" : conf.theme
                    }
                  )
                ]
              },
              yr
            );
          }),
          [1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950].map((yr) => {
            const i = FIGS.findIndex((f) => f.b >= yr);
            if (i < 0) return null;
            return /* @__PURE__ */ jsxs(
              "text",
              {
                x: LEFT - 58,
                y: yOf(i) + 2,
                textAnchor: "end",
                fontSize: 6.5,
                fill: "rgba(200,200,216,0.3)",
                fontStyle: "italic",
                children: [
                  "b.",
                  yr
                ]
              },
              yr
            );
          })
        ]
      }
    ),
    tooltip && /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      left: tooltip.x + 12,
      top: tooltip.y - 10,
      background: "rgba(10,14,26,0.95)",
      border: "1px solid rgba(200,200,216,0.2)",
      borderLeft: `3px solid ${SC[tooltip.school] || "#888"}`,
      padding: "8px 12px",
      borderRadius: 3,
      pointerEvents: "none",
      zIndex: 9999,
      maxWidth: 260,
      fontSize: 11,
      lineHeight: 1.6
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontWeight: "bold", color: "#e8e8f0", marginBottom: 2 }, children: tooltip.fig }),
      /* @__PURE__ */ jsxs("div", { style: { color: "#6a7090" }, children: [
        "b.",
        tooltip.birth,
        " \xB7 ",
        tooltip.school
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: 4, color: "rgba(200,200,216,0.7)" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#90CAF9", fontWeight: "bold" }, children: tooltip.year }),
        " ",
        "\xB7 score ",
        tooltip.score
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        marginTop: 3,
        color: "rgba(200,200,216,0.5)",
        fontStyle: "italic",
        fontSize: 10
      }, children: tooltip.theme })
    ] })
  ] });
}
function EraView({ selSchool }) {
  const [tooltip, setTooltip] = useState(null);
  const eraData = useMemo(() => {
    return ERAS.map((era) => {
      const members = FIGS_ALL.filter(
        (f) => f.b >= era.lo && (era.hi ? f.b < era.hi : true) && (!selSchool || f.s === selSchool)
      );
      const yearScores = {};
      for (const f of members) {
        for (const [yr, sc] of Object.entries(f.y)) {
          yearScores[yr] = (yearScores[yr] || 0) + sc;
        }
      }
      const maxSc = Math.max(1, ...Object.values(yearScores));
      return { ...era, members, yearScores, maxSc };
    });
  }, [selSchool]);
  const COL_W = 16, ROW_H = 54, LEFT = 170, TOP = 24, BOTTOM = 48;
  const svgW = LEFT + ALL_YEARS.length * COL_W + 24;
  const svgH = TOP + eraData.length * ROW_H + BOTTOM;
  const xOf = (yr) => LEFT + ALL_YEARS.indexOf(yr) * COL_W;
  return /* @__PURE__ */ jsxs("div", { style: { overflowX: "auto", padding: "16px 0" }, children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        width: svgW,
        height: svgH,
        style: { display: "block", fontFamily: "'Georgia',serif" },
        children: [
          eraData.map((era, ei) => {
            const y0 = TOP + ei * ROW_H;
            return /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx(
                "rect",
                {
                  x: LEFT,
                  y: y0,
                  width: ALL_YEARS.length * COL_W,
                  height: ROW_H - 2,
                  fill: era.bg,
                  rx: 1
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: LEFT - 6,
                  y: y0 + ROW_H / 2 + 4,
                  textAnchor: "end",
                  fontSize: 9.5,
                  fill: "rgba(200,200,216,0.8)",
                  fontStyle: "italic",
                  children: era.label
                }
              ),
              /* @__PURE__ */ jsxs(
                "text",
                {
                  x: LEFT - 6,
                  y: y0 + ROW_H / 2 + 15,
                  textAnchor: "end",
                  fontSize: 8,
                  fill: "rgba(200,200,216,0.35)",
                  children: [
                    era.members.length,
                    " figures"
                  ]
                }
              ),
              ALL_YEARS.map((yr) => {
                const sc = era.yearScores[yr] || 0;
                const pct = sc / era.maxSc;
                const col = `rgba(144,202,249,${pct * 0.85})`;
                return /* @__PURE__ */ jsx(
                  "rect",
                  {
                    x: xOf(yr) + 1,
                    y: y0 + 2,
                    width: COL_W - 2,
                    height: ROW_H - 6,
                    fill: col,
                    rx: 1,
                    onMouseEnter: (e) => {
                      const conf = CONF_BY_YEAR[yr] || {};
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        era: era.label,
                        year: yr,
                        score: sc,
                        n: era.members.filter((f) => f.y[yr]).length,
                        theme: conf.theme || ""
                      });
                    },
                    onMouseLeave: () => setTooltip(null),
                    style: { cursor: "pointer" }
                  },
                  yr
                );
              })
            ] }, era.label);
          }),
          ALL_YEARS.map((yr) => yr % 5 === 0 && /* @__PURE__ */ jsx(
            "text",
            {
              x: xOf(yr) + COL_W / 2,
              y: TOP + eraData.length * ROW_H + 14,
              textAnchor: "middle",
              fontSize: 8,
              fill: "rgba(200,200,216,0.45)",
              children: yr
            },
            yr
          ))
        ]
      }
    ),
    tooltip && /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      left: tooltip.x + 10,
      top: tooltip.y - 8,
      background: "rgba(10,14,26,0.95)",
      border: "1px solid rgba(144,202,249,0.3)",
      padding: "8px 12px",
      borderRadius: 3,
      pointerEvents: "none",
      zIndex: 9999,
      fontSize: 11,
      lineHeight: 1.6
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { color: "#90CAF9", fontWeight: "bold" }, children: tooltip.year }),
      /* @__PURE__ */ jsx("div", { style: { color: "#e8e8f0" }, children: tooltip.era }),
      /* @__PURE__ */ jsxs("div", { style: { color: "rgba(200,200,216,0.6)" }, children: [
        tooltip.n,
        " figures \xB7 score ",
        tooltip.score
      ] }),
      /* @__PURE__ */ jsx("div", { style: { color: "rgba(200,200,216,0.4)", fontStyle: "italic", fontSize: 10 }, children: tooltip.theme })
    ] })
  ] });
}
function TopFigView({ selSchool }) {
  const [tooltip, setTooltip] = useState(null);
  const figs = useMemo(() => {
    const src = selSchool ? FIGS_ALL.filter((f) => f.s === selSchool) : FIGS_ALL;
    return src.slice().sort((a, b) => b.df - a.df).slice(0, 40);
  }, [selSchool]);
  const LEFT = 190, RIGHT = 24, TOP = 8, ROW_H = 18;
  const svgW = LEFT + ALL_YEARS.length * 14 + RIGHT;
  const svgH = TOP + figs.length * ROW_H + 40;
  const xOf = (yr) => LEFT + ALL_YEARS.indexOf(yr) * 14 + 7;
  const yOf = (i) => TOP + i * ROW_H + ROW_H / 2;
  const maxScore = useMemo(
    () => Math.max(...figs.flatMap((f) => Object.values(f.y))),
    [figs]
  );
  return /* @__PURE__ */ jsxs("div", { style: { overflowX: "auto", padding: "8px 0" }, children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        width: svgW,
        height: svgH,
        style: { display: "block", fontFamily: "'Georgia',serif" },
        children: [
          figs.map((_, i) => /* @__PURE__ */ jsx(
            "rect",
            {
              x: LEFT,
              y: TOP + i * ROW_H,
              width: ALL_YEARS.length * 14,
              height: ROW_H,
              fill: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"
            },
            i
          )),
          ALL_YEARS.map((yr) => /* @__PURE__ */ jsx(
            "line",
            {
              x1: xOf(yr),
              y1: TOP,
              x2: xOf(yr),
              y2: TOP + figs.length * ROW_H,
              stroke: "rgba(200,200,216,0.06)",
              strokeWidth: 0.5
            },
            yr
          )),
          figs.map((fig, i) => {
            const col = SC[fig.s] || "#888";
            const ys = Object.keys(fig.y).map(Number).sort((a, b) => a - b);
            return /* @__PURE__ */ jsxs("g", { children: [
              ys.length >= 2 && /* @__PURE__ */ jsx(
                "line",
                {
                  x1: xOf(ys[0]),
                  y1: yOf(i),
                  x2: xOf(ys[ys.length - 1]),
                  y2: yOf(i),
                  stroke: col,
                  strokeWidth: 0.8,
                  opacity: 0.25,
                  strokeDasharray: "2,3"
                }
              ),
              ys.map((yr) => {
                const sc = fig.y[yr];
                const r = Math.max(2.5, Math.sqrt(sc / maxScore) * 7.5);
                return /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: xOf(yr),
                    cy: yOf(i),
                    r,
                    fill: col,
                    opacity: 0.75,
                    onMouseEnter: (e) => {
                      const conf = CONF_BY_YEAR[yr] || {};
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        fig: fig.n,
                        school: fig.s,
                        birth: fig.b,
                        year: yr,
                        score: sc,
                        theme: conf.theme || ""
                      });
                    },
                    onMouseLeave: () => setTooltip(null),
                    style: { cursor: "pointer" }
                  },
                  yr
                );
              }),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: LEFT - 5,
                  y: yOf(i) + 3.5,
                  textAnchor: "end",
                  fontSize: 9.5,
                  fill: col,
                  opacity: 0.9,
                  children: shortName(fig.n)
                }
              ),
              /* @__PURE__ */ jsxs(
                "text",
                {
                  x: LEFT - 5,
                  y: yOf(i) + 3.5,
                  textAnchor: "end",
                  dx: -70,
                  fontSize: 7.5,
                  fill: "rgba(200,200,216,0.3)",
                  children: [
                    fig.df,
                    "\xD7"
                  ]
                }
              )
            ] }, fig.n);
          }),
          ALL_YEARS.map((yr) => yr % 5 === 0 && /* @__PURE__ */ jsx(
            "text",
            {
              x: xOf(yr),
              y: TOP + figs.length * ROW_H + 14,
              textAnchor: "middle",
              fontSize: 7.5,
              fill: "rgba(200,200,216,0.4)",
              children: yr
            },
            yr
          ))
        ]
      }
    ),
    tooltip && /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      left: tooltip.x + 12,
      top: tooltip.y - 8,
      background: "rgba(10,14,26,0.95)",
      border: "1px solid rgba(200,200,216,0.2)",
      borderLeft: `3px solid ${SC[tooltip.school] || "#888"}`,
      padding: "8px 12px",
      borderRadius: 3,
      pointerEvents: "none",
      zIndex: 9999,
      fontSize: 11,
      lineHeight: 1.6
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontWeight: "bold", color: "#e8e8f0" }, children: tooltip.fig }),
      /* @__PURE__ */ jsxs("div", { style: { color: "#6a7090" }, children: [
        "b.",
        tooltip.birth,
        " \xB7 ",
        tooltip.school
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: 3 }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#90CAF9", fontWeight: "bold" }, children: tooltip.year }),
        " ",
        "\xB7 score ",
        tooltip.score
      ] }),
      /* @__PURE__ */ jsx("div", { style: { color: "rgba(200,200,216,0.4)", fontStyle: "italic", fontSize: 10 }, children: tooltip.theme })
    ] })
  ] });
}
export {
  AGWGazeMap as default
};
