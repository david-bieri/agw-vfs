// agw_analysis_views.jsx
import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as d3 from "d3";
import { jsx, jsxs } from "react/jsx-runtime";
var RAW = { "flow": [{ "year": 1980, "theme": "Klassische National\xF6konomie", "Classical": 34.9, "Historical School": 0, "National Economy": 0, "Marxist": 11.6, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 41.9, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 11.6, "Philosophy": 0, "Other": 0 }, { "year": 1981, "theme": "Merkantilismus und Kameralismus", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1982, "theme": "Theoriegeschichte - wozu?", "Classical": 0, "Historical School": 83.3, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 16.7, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1983, "theme": "Marx, Keynes, Schumpeter", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 5, "Keynesian": 52.5, "Post-Keynesian/Sraffian": 3, "Evolutionary": 5.9, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 17.8, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 7.9, "Philosophy": 7.9, "Other": 0 }, { "year": 1984, "theme": "Deutsche National\xF6konomie Ende des 18. Jh.", "Classical": 0, "Historical School": 100, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1985, "theme": "Entwicklungen der deutschsprachigen National\xF6konomie im 19. Jh.", "Classical": 33.8, "Historical School": 24.6, "National Economy": 0, "Marxist": 0, "Austrian School": 10.8, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 10.8, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 1.5, "Neoclassical": 15.4, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 1.5, "Philosophy": 0, "Other": 1.5 }, { "year": 1986, "theme": "Allgemeine Gleichgewichtsanalyse", "Classical": 100, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1987, "theme": "Konjunkturtheorie im ausgehenden 19. Jahrhundert", "Classical": 0, "Historical School": 16.7, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 16.7, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 66.7, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1988, "theme": "Deutschsprachige Wirtschafts-, Konjunktur- und Geldtheorie", "Classical": 100, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1989, "theme": "Friedrich List; Carl Menger; Lorenz von Stein", "Classical": 15.1, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 9.4, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 47.2, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 28.3, "Philosophy": 0, "Other": 0 }, { "year": 1990, "theme": "Wirtschaft und Wirtschaftswissenschaften in der Belletristik", "Classical": 0, "Historical School": 25, "National Economy": 0, "Marxist": 25, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 25, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 25, "Philosophy": 0, "Other": 0 }, { "year": 1991, "theme": "Osteurop\xE4ische Dogmengeschichte", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 1992, "theme": "Deutsche Finanzwissenschaft zwischen 1918 und 1939", "Classical": 6.1, "Historical School": 18.2, "National Economy": 0, "Marxist": 0, "Austrian School": 22.3, "Keynesian": 0, "Post-Keynesian/Sraffian": 0.7, "Evolutionary": 4.7, "Ordoliberalismus": 16.2, "Raumwirtschaftslehre": 0, "Neoclassical": 18.9, "Mathematical Economics": 0, "Institutional": 1.4, "Development Economics": 0, "Contemporary": 0.7, "Philosophy": 5.4, "Other": 5.4 }, { "year": 1993, "theme": "Johann Heinrich von Th\xFCnen als Wirtschaftstheoretiker", "Classical": 7.9, "Historical School": 11.1, "National Economy": 0, "Marxist": 4.8, "Austrian School": 4.8, "Keynesian": 0, "Post-Keynesian/Sraffian": 7.9, "Evolutionary": 7.1, "Ordoliberalismus": 4.8, "Raumwirtschaftslehre": 4.8, "Neoclassical": 17.5, "Mathematical Economics": 6.3, "Institutional": 0, "Development Economics": 15.1, "Contemporary": 7.9, "Philosophy": 0, "Other": 0 }, { "year": 1994, "theme": "Revolution und Evolution in der Wirtschaftstheorie", "Classical": 0, "Historical School": 25.9, "National Economy": 0, "Marxist": 4.3, "Austrian School": 0, "Keynesian": 12.1, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 4.3, "Raumwirtschaftslehre": 0, "Neoclassical": 25, "Mathematical Economics": 9.5, "Institutional": 4.3, "Development Economics": 6.9, "Contemporary": 5.2, "Philosophy": 2.6, "Other": 0 }, { "year": 1995, "theme": "Umsetzung wirtschaftspolitischer Grundkonzeptionen I", "Classical": 32.7, "Historical School": 14.3, "National Economy": 0, "Marxist": 0, "Austrian School": 46.9, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 4.1, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 2, "Other": 0 }, { "year": 1996, "theme": "Umsetzung wirtschaftspolitischer Grundkonzeptionen II", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 16.1, "Keynesian": 12.9, "Post-Keynesian/Sraffian": 0, "Evolutionary": 8.1, "Ordoliberalismus": 21, "Raumwirtschaftslehre": 0, "Neoclassical": 8.1, "Mathematical Economics": 12.9, "Institutional": 8.1, "Development Economics": 0, "Contemporary": 12.9, "Philosophy": 0, "Other": 0 }, { "year": 1997, "theme": "Knut Wicksell", "Classical": 6.9, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 5.5, "Keynesian": 13.5, "Post-Keynesian/Sraffian": 9.4, "Evolutionary": 2.2, "Ordoliberalismus": 3.6, "Raumwirtschaftslehre": 0, "Neoclassical": 33.7, "Mathematical Economics": 0.8, "Institutional": 4.4, "Development Economics": 5.2, "Contemporary": 13.3, "Philosophy": 0, "Other": 1.4 }, { "year": 1998, "theme": "John Stuart Mill", "Classical": 57.7, "Historical School": 3, "National Economy": 0, "Marxist": 1.3, "Austrian School": 4.3, "Keynesian": 2.2, "Post-Keynesian/Sraffian": 3.3, "Evolutionary": 0.9, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 9.9, "Mathematical Economics": 2, "Institutional": 4.7, "Development Economics": 0, "Contemporary": 4.3, "Philosophy": 3.9, "Other": 2.5 }, { "year": 1999, "theme": "Die \xC4ltere Historische Schule", "Classical": 9.2, "Historical School": 38.5, "National Economy": 0.6, "Marxist": 5.2, "Austrian School": 15.5, "Keynesian": 2.3, "Post-Keynesian/Sraffian": 0, "Evolutionary": 1.7, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 12.3, "Mathematical Economics": 1.7, "Institutional": 0, "Development Economics": 3.8, "Contemporary": 5.9, "Philosophy": 1.7, "Other": 1.7 }, { "year": 2e3, "theme": "Ideen, Methoden und Entwicklungen", "Classical": 18, "Historical School": 29.4, "National Economy": 0, "Marxist": 0, "Austrian School": 18.6, "Keynesian": 3, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 4.5, "Raumwirtschaftslehre": 0, "Neoclassical": 6, "Mathematical Economics": 2.4, "Institutional": 1.5, "Development Economics": 0, "Contemporary": 3, "Philosophy": 13.5, "Other": 0 }, { "year": 2001, "theme": "Deutschsprachige Wirtschaftswissenschaft nach 1945 I", "Classical": 4.3, "Historical School": 25.3, "National Economy": 1.5, "Marxist": 4.5, "Austrian School": 6.2, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 2.3, "Ordoliberalismus": 0.6, "Raumwirtschaftslehre": 0, "Neoclassical": 8.7, "Mathematical Economics": 3.4, "Institutional": 11.7, "Development Economics": 6, "Contemporary": 15.7, "Philosophy": 5.1, "Other": 4.5 }, { "year": 2002, "theme": "Deutschsprachige Wirtschaftswissenschaft nach 1945 II", "Classical": 5.6, "Historical School": 6.5, "National Economy": 2.2, "Marxist": 9.6, "Austrian School": 7.6, "Keynesian": 0, "Post-Keynesian/Sraffian": 6.5, "Evolutionary": 4, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0.7, "Neoclassical": 30.9, "Mathematical Economics": 9.2, "Institutional": 0.7, "Development Economics": 2.2, "Contemporary": 4.7, "Philosophy": 0.7, "Other": 8.7 }, { "year": 2003, "theme": "\xD6konomie und Religion", "Classical": 6.6, "Historical School": 18.3, "National Economy": 0, "Marxist": 6.1, "Austrian School": 10.6, "Keynesian": 1.2, "Post-Keynesian/Sraffian": 6, "Evolutionary": 3.8, "Ordoliberalismus": 1.5, "Raumwirtschaftslehre": 0, "Neoclassical": 22, "Mathematical Economics": 12.2, "Institutional": 1.7, "Development Economics": 1.2, "Contemporary": 5.2, "Philosophy": 1.7, "Other": 1.8 }, { "year": 2004, "theme": "Wirtschaftswissenschaft und Technik", "Classical": 0.3, "Historical School": 11.6, "National Economy": 0, "Marxist": 0.3, "Austrian School": 4.7, "Keynesian": 4.8, "Post-Keynesian/Sraffian": 8.2, "Evolutionary": 0.3, "Ordoliberalismus": 23.9, "Raumwirtschaftslehre": 0, "Neoclassical": 19.6, "Mathematical Economics": 2.8, "Institutional": 3.7, "Development Economics": 0, "Contemporary": 5.2, "Philosophy": 1.4, "Other": 13.4 }, { "year": 2005, "theme": "German\u2013American Economic Thought", "Classical": 8.9, "Historical School": 14.4, "National Economy": 0, "Marxist": 0.8, "Austrian School": 17.9, "Keynesian": 0.8, "Post-Keynesian/Sraffian": 0.8, "Evolutionary": 6.6, "Ordoliberalismus": 0.8, "Raumwirtschaftslehre": 0.8, "Neoclassical": 9, "Mathematical Economics": 13.5, "Institutional": 3.2, "Development Economics": 1.5, "Contemporary": 6.6, "Philosophy": 13.7, "Other": 0.8 }, { "year": 2006, "theme": "Wissen / The Knowledge Economy", "Classical": 0, "Historical School": 57.4, "National Economy": 0, "Marxist": 0, "Austrian School": 13.9, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 2.8, "Ordoliberalismus": 4.6, "Raumwirtschaftslehre": 4.6, "Neoclassical": 4.6, "Mathematical Economics": 4.6, "Institutional": 0, "Development Economics": 4.6, "Contemporary": 0, "Philosophy": 2.8, "Other": 0 }, { "year": 2007, "theme": "Wechselseitige Einfl\xFCsse", "Classical": 12.8, "Historical School": 2.7, "National Economy": 0, "Marxist": 1.7, "Austrian School": 25.9, "Keynesian": 11.3, "Post-Keynesian/Sraffian": 1.7, "Evolutionary": 6.1, "Ordoliberalismus": 1, "Raumwirtschaftslehre": 2.3, "Neoclassical": 9.4, "Mathematical Economics": 11.9, "Institutional": 3.1, "Development Economics": 1, "Contemporary": 3.8, "Philosophy": 3.1, "Other": 2.1 }, { "year": 2008, "theme": "Einfluss deutschsprachigen Denkens in Japan", "Classical": 5.9, "Historical School": 20, "National Economy": 0.8, "Marxist": 0.8, "Austrian School": 1.2, "Keynesian": 0, "Post-Keynesian/Sraffian": 1.7, "Evolutionary": 1.5, "Ordoliberalismus": 2.7, "Raumwirtschaftslehre": 40.9, "Neoclassical": 11.7, "Mathematical Economics": 2.9, "Institutional": 2.1, "Development Economics": 0, "Contemporary": 4.4, "Philosophy": 2, "Other": 1.5 }, { "year": 2009, "theme": "Geschichte der Entwicklungstheorien", "Classical": 5.5, "Historical School": 30.4, "National Economy": 0, "Marxist": 10.6, "Austrian School": 27.3, "Keynesian": 0, "Post-Keynesian/Sraffian": 1.7, "Evolutionary": 5.1, "Ordoliberalismus": 4.4, "Raumwirtschaftslehre": 0, "Neoclassical": 1.7, "Mathematical Economics": 4.4, "Institutional": 0, "Development Economics": 1.7, "Contemporary": 0, "Philosophy": 7.2, "Other": 0 }, { "year": 2010, "theme": "\xD6konomik zwischen Natur- und Geisteswissenschaften", "Classical": 0.8, "Historical School": 8.7, "National Economy": 1.5, "Marxist": 1.2, "Austrian School": 1.5, "Keynesian": 0.8, "Post-Keynesian/Sraffian": 9.5, "Evolutionary": 0, "Ordoliberalismus": 18.1, "Raumwirtschaftslehre": 16.7, "Neoclassical": 18.2, "Mathematical Economics": 1.2, "Institutional": 15.8, "Development Economics": 4.3, "Contemporary": 1.7, "Philosophy": 0, "Other": 0 }, { "year": 2011, "theme": "Entwicklung der Raumwirtschaftslehre", "Classical": 2.4, "Historical School": 10.8, "National Economy": 0, "Marxist": 0, "Austrian School": 16.8, "Keynesian": 3.2, "Post-Keynesian/Sraffian": 3.5, "Evolutionary": 3.2, "Ordoliberalismus": 5, "Raumwirtschaftslehre": 0.8, "Neoclassical": 27.4, "Mathematical Economics": 6.2, "Institutional": 5.9, "Development Economics": 7.6, "Contemporary": 3, "Philosophy": 1.1, "Other": 3 }, { "year": 2012, "theme": "Zeit um den Ersten Weltkrieg", "Classical": 1.3, "Historical School": 20.6, "National Economy": 0, "Marxist": 0, "Austrian School": 4.3, "Keynesian": 0, "Post-Keynesian/Sraffian": 5.2, "Evolutionary": 16.7, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 11.2, "Mathematical Economics": 10.3, "Institutional": 12, "Development Economics": 6.4, "Contemporary": 4.3, "Philosophy": 7.7, "Other": 0 }, { "year": 2013, "theme": "Marx und Engels \u2014 Neue Perspektiven", "Classical": 7.6, "Historical School": 5.8, "National Economy": 2.9, "Marxist": 19.1, "Austrian School": 12.2, "Keynesian": 3.6, "Post-Keynesian/Sraffian": 5.4, "Evolutionary": 0, "Ordoliberalismus": 1.8, "Raumwirtschaftslehre": 0, "Neoclassical": 21.9, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 9.7, "Contemporary": 4.7, "Philosophy": 5.4, "Other": 0 }, { "year": 2014, "theme": "Macht oder \xF6konomisches Gesetz?", "Classical": 14, "Historical School": 3.2, "National Economy": 0, "Marxist": 3.9, "Austrian School": 5, "Keynesian": 5.4, "Post-Keynesian/Sraffian": 9.7, "Evolutionary": 5.4, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 16.8, "Neoclassical": 9.7, "Mathematical Economics": 1.8, "Institutional": 8.2, "Development Economics": 0, "Contemporary": 12.2, "Philosophy": 4.7, "Other": 0 }, { "year": 2015, "theme": "Kontinuit\xE4t und Wandel in der Institutionen\xF6konomie", "Classical": 3.1, "Historical School": 6.7, "National Economy": 0, "Marxist": 3.1, "Austrian School": 22.1, "Keynesian": 3.1, "Post-Keynesian/Sraffian": 9.5, "Evolutionary": 4.8, "Ordoliberalismus": 10.5, "Raumwirtschaftslehre": 0, "Neoclassical": 21.1, "Mathematical Economics": 3.1, "Institutional": 2.6, "Development Economics": 3.1, "Contemporary": 4.3, "Philosophy": 3.1, "Other": 0 }, { "year": 2016, "theme": "Stagnations- und Deflationstheorien", "Classical": 5.6, "Historical School": 4.1, "National Economy": 0, "Marxist": 2.4, "Austrian School": 12.2, "Keynesian": 2.4, "Post-Keynesian/Sraffian": 1.1, "Evolutionary": 14.1, "Ordoliberalismus": 3.5, "Raumwirtschaftslehre": 0, "Neoclassical": 7, "Mathematical Economics": 7.2, "Institutional": 16.1, "Development Economics": 7.4, "Contemporary": 2.1, "Philosophy": 8.2, "Other": 6.5 }, { "year": 2017, "theme": "Einkommens- und Verm\xF6gensverteilung", "Classical": 1.9, "Historical School": 0.6, "National Economy": 0, "Marxist": 0, "Austrian School": 34.1, "Keynesian": 21.7, "Post-Keynesian/Sraffian": 7.3, "Evolutionary": 8.9, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 6.2, "Neoclassical": 13.4, "Mathematical Economics": 0.6, "Institutional": 0.6, "Development Economics": 1.5, "Contemporary": 3.4, "Philosophy": 0, "Other": 0 }, { "year": 2018, "theme": "Kameralismus und Merkantilismus", "Classical": 13.5, "Historical School": 26.6, "National Economy": 1.5, "Marxist": 1.5, "Austrian School": 0.9, "Keynesian": 3.1, "Post-Keynesian/Sraffian": 0, "Evolutionary": 8.9, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 1.5, "Neoclassical": 9.8, "Mathematical Economics": 0, "Institutional": 0.9, "Development Economics": 9.5, "Contemporary": 2.4, "Philosophy": 10.7, "Other": 9.2 }, { "year": 2019, "theme": "\xD6konomie und Evolution", "Classical": 0.8, "Historical School": 7.4, "National Economy": 0, "Marxist": 3.2, "Austrian School": 33.3, "Keynesian": 22.2, "Post-Keynesian/Sraffian": 1, "Evolutionary": 2.7, "Ordoliberalismus": 5.6, "Raumwirtschaftslehre": 3.1, "Neoclassical": 11.8, "Mathematical Economics": 1.8, "Institutional": 1.4, "Development Economics": 3.3, "Contemporary": 1.8, "Philosophy": 0, "Other": 0.7 }, { "year": 2021, "theme": "Entwicklung der Konjunkturforschung", "Classical": 0, "Historical School": 54.3, "National Economy": 0, "Marxist": 2.2, "Austrian School": 2.2, "Keynesian": 3.5, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0.8, "Ordoliberalismus": 4.9, "Raumwirtschaftslehre": 0, "Neoclassical": 4.3, "Mathematical Economics": 2.2, "Institutional": 8.4, "Development Economics": 6.2, "Contemporary": 3.5, "Philosophy": 6.8, "Other": 0.8 }, { "year": 2022, "theme": "Geschichte des Vereins f\xFCr Socialpolitik", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }, { "year": 2023, "theme": "Adam Smith@300", "Classical": 0, "Historical School": 0, "National Economy": 0, "Marxist": 0, "Austrian School": 0, "Keynesian": 0, "Post-Keynesian/Sraffian": 0, "Evolutionary": 0, "Ordoliberalismus": 0, "Raumwirtschaftslehre": 0, "Neoclassical": 0, "Mathematical Economics": 0, "Institutional": 0, "Development Economics": 0, "Contemporary": 0, "Philosophy": 0, "Other": 0 }], "nodes": [{ "id": "Joseph Alois Schumpeter", "s": "Evolutionary", "b": 1883, "df": 28 }, { "id": "Friedrich August von Hayek", "s": "Austrian School", "b": 1899, "df": 20 }, { "id": "Paul Anthony Samuelson", "s": "Neoclassical", "b": 1915, "df": 18 }, { "id": "Alfred Marshall", "s": "Neoclassical", "b": 1842, "df": 18 }, { "id": "Adam Smith", "s": "Classical", "b": 1723, "df": 18 }, { "id": "Mark Blaug", "s": "Contemporary", "b": 1927, "df": 17 }, { "id": "John Maynard Keynes", "s": "Keynesian", "b": 1883, "df": 17 }, { "id": "Max Weber", "s": "Historical School", "b": 1864, "df": 15 }, { "id": "Piero Sraffa", "s": "Post-Keynesian/Sraffian", "b": 1898, "df": 14 }, { "id": "Werner Sombart", "s": "Historical School", "b": 1863, "df": 14 }, { "id": "Carl Menger", "s": "Austrian School", "b": 1840, "df": 14 }, { "id": "John Stuart Mill", "s": "Classical", "b": 1806, "df": 14 }, { "id": "John Richard Hicks", "s": "Neoclassical", "b": 1904, "df": 13 }, { "id": "Knut Wicksell", "s": "Neoclassical", "b": 1851, "df": 13 }, { "id": "Karl Marx", "s": "Marxist", "b": 1818, "df": 13 }, { "id": "Wilhelm Georg Friedrich Roscher", "s": "Historical School", "b": 1817, "df": 13 }, { "id": "Erich Wolfgang Streissler", "s": "Austrian School", "b": 1933, "df": 12 }, { "id": "Karl Gustav Cassel", "s": "Neoclassical", "b": 1866, "df": 12 }, { "id": "David Ricardo", "s": "Classical", "b": 1772, "df": 12 }, { "id": "Milton Friedman", "s": "Neoclassical", "b": 1912, "df": 11 }, { "id": "Walter Eucken", "s": "Ordoliberalismus", "b": 1891, "df": 11 }, { "id": "Eugen von B\xF6hm-Bawerk", "s": "Austrian School", "b": 1851, "df": 11 }, { "id": "J\xFCrg Niehans", "s": "Neoclassical", "b": 1919, "df": 10 }, { "id": "Colin Clark", "s": "Development Economics", "b": 1905, "df": 10 }, { "id": "Erich Schneider", "s": "Neoclassical", "b": 1900, "df": 10 }, { "id": "Karl Brandt", "s": "Development Economics", "b": 1899, "df": 10 }, { "id": "Edgar Salin", "s": "Historical School", "b": 1892, "df": 10 }, { "id": "Arthur Cecil Pigou", "s": "Neoclassical", "b": 1877, "df": 10 }, { "id": "Gustav von Schmoller", "s": "Historical School", "b": 1838, "df": 10 }, { "id": "William Stanley Jevons", "s": "Neoclassical", "b": 1835, "df": 10 }, { "id": "John Locke", "s": "Philosophy", "b": 1632, "df": 10 }, { "id": "Keith Tribe", "s": "Historical School", "b": 1949, "df": 9 }, { "id": "Robert Merton Solow", "s": "Neoclassical", "b": 1924, "df": 9 }, { "id": "Ernst Helmst\xE4dter", "s": "Contemporary", "b": 1924, "df": 9 }, { "id": "William Jack Baumol", "s": "Neoclassical", "b": 1922, "df": 9 }, { "id": "James McGill Buchanan", "s": "Institutional", "b": 1919, "df": 9 }, { "id": "Gottfried von Haberler", "s": "Austrian School", "b": 1900, "df": 9 }, { "id": "Ludwig von Mises", "s": "Austrian School", "b": 1881, "df": 9 }, { "id": "Bruno Hildebrand", "s": "Historical School", "b": 1812, "df": 9 }, { "id": "Paul Robin Krugman", "s": "Raumwirtschaftslehre", "b": 1953, "df": 8 }, { "id": "Joseph Eugene Stiglitz", "s": "Contemporary", "b": 1943, "df": 8 }, { "id": "Axel Leijonhufvud", "s": "Keynesian", "b": 1933, "df": 8 }, { "id": "Harald Winkel", "s": "Historical School", "b": 1928, "df": 8 }, { "id": "Karl H\xE4user", "s": "Contemporary", "b": 1920, "df": 8 }, { "id": "Joan Violet Robinson", "s": "Post-Keynesian/Sraffian", "b": 1903, "df": 8 }, { "id": "Wilhelm R\xF6pke", "s": "Ordoliberalismus", "b": 1899, "df": 8 }, { "id": "Allan George Barnard Fisher", "s": "Development Economics", "b": 1895, "df": 8 }, { "id": "Karl Diehl", "s": "Historical School", "b": 1864, "df": 8 }, { "id": "Lujo Brentano", "s": "Historical School", "b": 1844, "df": 8 }], "edges": [{ "a": "Friedrich August von Hayek", "b": "Joseph Alois Schumpeter", "w": 17 }, { "a": "John Maynard Keynes", "b": "Joseph Alois Schumpeter", "w": 15 }, { "a": "Adam Smith", "b": "Joseph Alois Schumpeter", "w": 14 }, { "a": "Friedrich August von Hayek", "b": "Paul Anthony Samuelson", "w": 14 }, { "a": "Alfred Marshall", "b": "Joseph Alois Schumpeter", "w": 13 }, { "a": "Joseph Alois Schumpeter", "b": "Paul Anthony Samuelson", "w": 13 }, { "a": "Adam Smith", "b": "Friedrich August von Hayek", "w": 13 }, { "a": "Joseph Alois Schumpeter", "b": "Mark Blaug", "w": 13 }, { "a": "Adam Smith", "b": "John Stuart Mill", "w": 12 }, { "a": "Adam Smith", "b": "Alfred Marshall", "w": 12 }, { "a": "Joseph Alois Schumpeter", "b": "Werner Sombart", "w": 12 }, { "a": "Joseph Alois Schumpeter", "b": "Knut Wicksell", "w": 12 }, { "a": "Joseph Alois Schumpeter", "b": "Piero Sraffa", "w": 12 }, { "a": "Mark Blaug", "b": "Paul Anthony Samuelson", "w": 12 }, { "a": "Carl Menger", "b": "Joseph Alois Schumpeter", "w": 12 }, { "a": "Friedrich August von Hayek", "b": "Mark Blaug", "w": 12 }, { "a": "Friedrich August von Hayek", "b": "John Maynard Keynes", "w": 12 }, { "a": "Carl Menger", "b": "Friedrich August von Hayek", "w": 12 }, { "a": "Joseph Alois Schumpeter", "b": "Max Weber", "w": 12 }, { "a": "Joseph Alois Schumpeter", "b": "Wilhelm Georg Friedrich Roscher", "w": 11 }, { "a": "Joseph Alois Schumpeter", "b": "Karl Marx", "w": 11 }, { "a": "Mark Blaug", "b": "Piero Sraffa", "w": 11 }, { "a": "Alfred Marshall", "b": "Friedrich August von Hayek", "w": 11 }, { "a": "Friedrich August von Hayek", "b": "Piero Sraffa", "w": 11 }, { "a": "Friedrich August von Hayek", "b": "Karl Marx", "w": 11 }, { "a": "Joseph Alois Schumpeter", "b": "Milton Friedman", "w": 10 }, { "a": "Erich Schneider", "b": "Joseph Alois Schumpeter", "w": 10 }, { "a": "Gustav von Schmoller", "b": "Joseph Alois Schumpeter", "w": 10 }, { "a": "Adam Smith", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "John Richard Hicks", "b": "Joseph Alois Schumpeter", "w": 10 }, { "a": "Alfred Marshall", "b": "John Stuart Mill", "w": 10 }, { "a": "Alfred Marshall", "b": "John Richard Hicks", "w": 10 }, { "a": "Joseph Alois Schumpeter", "b": "Karl Gustav Cassel", "w": 10 }, { "a": "Edgar Salin", "b": "Joseph Alois Schumpeter", "w": 10 }, { "a": "Karl Gustav Cassel", "b": "Knut Wicksell", "w": 10 }, { "a": "Alfred Marshall", "b": "Karl Marx", "w": 10 }, { "a": "Alfred Marshall", "b": "Wilhelm Georg Friedrich Roscher", "w": 10 }, { "a": "Knut Wicksell", "b": "Piero Sraffa", "w": 10 }, { "a": "Eugen von B\xF6hm-Bawerk", "b": "Joseph Alois Schumpeter", "w": 10 }, { "a": "John Maynard Keynes", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "Paul Anthony Samuelson", "b": "Piero Sraffa", "w": 10 }, { "a": "John Richard Hicks", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "Knut Wicksell", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "John Maynard Keynes", "b": "Mark Blaug", "w": 10 }, { "a": "Friedrich August von Hayek", "b": "John Richard Hicks", "w": 10 }, { "a": "Alfred Marshall", "b": "Mark Blaug", "w": 10 }, { "a": "Adam Smith", "b": "John Maynard Keynes", "w": 10 }, { "a": "Adam Smith", "b": "Karl Marx", "w": 10 }, { "a": "Friedrich August von Hayek", "b": "Max Weber", "w": 10 }, { "a": "Friedrich August von Hayek", "b": "Milton Friedman", "w": 10 }, { "a": "Alfred Marshall", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "Carl Menger", "b": "Paul Anthony Samuelson", "w": 10 }, { "a": "Friedrich August von Hayek", "b": "Werner Sombart", "w": 10 }, { "a": "Joseph Alois Schumpeter", "b": "Walter Eucken", "w": 10 }, { "a": "John Stuart Mill", "b": "Joseph Alois Schumpeter", "w": 9 }, { "a": "David Ricardo", "b": "Joseph Alois Schumpeter", "w": 9 }, { "a": "Friedrich August von Hayek", "b": "Wilhelm Georg Friedrich Roscher", "w": 9 }, { "a": "James McGill Buchanan", "b": "Joseph Alois Schumpeter", "w": 9 }, { "a": "Joseph Alois Schumpeter", "b": "Karl Brandt", "w": 9 }, { "a": "Alfred Marshall", "b": "Piero Sraffa", "w": 9 }, { "a": "Alfred Marshall", "b": "Knut Wicksell", "w": 9 }, { "a": "Alfred Marshall", "b": "Karl Gustav Cassel", "w": 9 }, { "a": "Karl Gustav Cassel", "b": "Piero Sraffa", "w": 9 }, { "a": "Eugen von B\xF6hm-Bawerk", "b": "John Maynard Keynes", "w": 9 }, { "a": "John Maynard Keynes", "b": "John Richard Hicks", "w": 9 }, { "a": "John Richard Hicks", "b": "Piero Sraffa", "w": 9 }, { "a": "John Richard Hicks", "b": "Knut Wicksell", "w": 9 }, { "a": "Friedrich August von Hayek", "b": "Robert Merton Solow", "w": 9 }, { "a": "Bruno Hildebrand", "b": "Friedrich August von Hayek", "w": 9 }, { "a": "Alfred Marshall", "b": "Carl Menger", "w": 9 }, { "a": "Adam Smith", "b": "Mark Blaug", "w": 9 }, { "a": "Adam Smith", "b": "Carl Menger", "w": 9 }, { "a": "Karl Marx", "b": "Mark Blaug", "w": 9 }, { "a": "Carl Menger", "b": "Karl Marx", "w": 9 }, { "a": "Friedrich August von Hayek", "b": "Knut Wicksell", "w": 9 }, { "a": "Milton Friedman", "b": "Paul Anthony Samuelson", "w": 9 }, { "a": "Friedrich August von Hayek", "b": "Walter Eucken", "w": 9 }, { "a": "Max Weber", "b": "Werner Sombart", "w": 9 }, { "a": "Gottfried von Haberler", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Axel Leijonhufvud", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Alfred Marshall", "b": "John Maynard Keynes", "w": 8 }, { "a": "John Maynard Keynes", "b": "Milton Friedman", "w": 8 }, { "a": "Friedrich August von Hayek", "b": "John Stuart Mill", "w": 8 }, { "a": "John Stuart Mill", "b": "Paul Anthony Samuelson", "w": 8 }, { "a": "Adam Smith", "b": "Wilhelm Georg Friedrich Roscher", "w": 8 }, { "a": "Adam Smith", "b": "David Ricardo", "w": 8 }, { "a": "David Ricardo", "b": "John Stuart Mill", "w": 8 }, { "a": "Joseph Alois Schumpeter", "b": "William Stanley Jevons", "w": 8 }, { "a": "Adam Smith", "b": "John Richard Hicks", "w": 8 }, { "a": "Joseph Alois Schumpeter", "b": "Wilhelm R\xF6pke", "w": 8 }, { "a": "Mark Blaug", "b": "Werner Sombart", "w": 8 }, { "a": "Knut Wicksell", "b": "Mark Blaug", "w": 8 }, { "a": "Karl Gustav Cassel", "b": "Mark Blaug", "w": 8 }, { "a": "Arthur Cecil Pigou", "b": "Mark Blaug", "w": 8 }, { "a": "Mark Blaug", "b": "William Jack Baumol", "w": 8 }, { "a": "Erich Wolfgang Streissler", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Joseph Alois Schumpeter", "b": "J\xFCrg Niehans", "w": 8 }, { "a": "Colin Clark", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Ernst Helmst\xE4dter", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Alfred Marshall", "b": "Erich Wolfgang Streissler", "w": 8 }, { "a": "Ernst Helmst\xE4dter", "b": "J\xFCrg Niehans", "w": 8 }, { "a": "Joseph Alois Schumpeter", "b": "Ludwig von Mises", "w": 8 }, { "a": "Karl Gustav Cassel", "b": "Paul Anthony Samuelson", "w": 8 }, { "a": "John Richard Hicks", "b": "Mark Blaug", "w": 8 }, { "a": "John Maynard Keynes", "b": "Piero Sraffa", "w": 8 }, { "a": "Joseph Alois Schumpeter", "b": "Robert Merton Solow", "w": 8 }, { "a": "Eugen von B\xF6hm-Bawerk", "b": "Friedrich August von Hayek", "w": 8 }, { "a": "Friedrich August von Hayek", "b": "Ludwig von Mises", "w": 8 }, { "a": "Alfred Marshall", "b": "Arthur Cecil Pigou", "w": 8 }, { "a": "Carl Menger", "b": "Mark Blaug", "w": 8 }, { "a": "Carl Menger", "b": "John Maynard Keynes", "w": 8 }, { "a": "John Maynard Keynes", "b": "Karl Marx", "w": 8 }, { "a": "Carl Menger", "b": "Piero Sraffa", "w": 8 }, { "a": "Carl Menger", "b": "John Richard Hicks", "w": 8 }, { "a": "John Stuart Mill", "b": "Karl Marx", "w": 8 }, { "a": "John Locke", "b": "Joseph Alois Schumpeter", "w": 8 }, { "a": "Colin Clark", "b": "Friedrich August von Hayek", "w": 8 }, { "a": "Karl Marx", "b": "Paul Anthony Samuelson", "w": 8 }, { "a": "Alfred Marshall", "b": "Max Weber", "w": 8 }, { "a": "Adam Smith", "b": "Max Weber", "w": 8 }], "slope": [{ "n": "Walter Eucken", "s": "Ordoliberalismus", "h1": 0, "h2": 315, "ratio": 315 }, { "n": "Paul Robin Krugman", "s": "Raumwirtschaftslehre", "h1": 0, "h2": 244, "ratio": 244 }, { "n": "Geoffrey Martin Hodgson", "s": "Institutional", "h1": 0, "h2": 119, "ratio": 119 }, { "n": "Kenneth Joseph Arrow", "s": "Mathematical Economics", "h1": 0, "h2": 82, "ratio": 82 }, { "n": "Fritz Machlup", "s": "Austrian School", "h1": 0, "h2": 80, "ratio": 80 }, { "n": "Heinrich von Stackelberg", "s": "Mathematical Economics", "h1": 0, "h2": 78, "ratio": 78 }, { "n": "Knut Borchardt", "s": "Historical School", "h1": 0, "h2": 70, "ratio": 70 }, { "n": "Alvin Harvey Hansen", "s": "Keynesian", "h1": 0, "h2": 67, "ratio": 67 }, { "n": "Franz Boese", "s": "Historical School", "h1": 0, "h2": 66, "ratio": 66 }, { "n": "Robert Emerson Lucas Jr.", "s": "Neoclassical", "h1": 0, "h2": 65, "ratio": 65 }, { "n": "Karl Brunner", "s": "Neoclassical", "h1": 0, "h2": 63, "ratio": 63 }, { "n": "Erich Gutenberg", "s": "Other", "h1": 0, "h2": 63, "ratio": 63 }, { "n": "Karl Raimund Popper", "s": "Philosophy", "h1": 52, "h2": 0, "ratio": 0 }, { "n": "Jeremy Bentham", "s": "Classical", "h1": 73, "h2": 0, "ratio": 0 }, { "n": "John Stuart Mill", "s": "Classical", "h1": 588, "h2": 59, "ratio": 0.1 }, { "n": "Friedrich von Wieser", "s": "Austrian School", "h1": 47, "h2": 6, "ratio": 0.1 }, { "n": "Walter Bagehot", "s": "Classical", "h1": 21, "h2": 5, "ratio": 0.2 }, { "n": "Adolph Wagner", "s": "Historical School", "h1": 68, "h2": 20, "ratio": 0.3 }, { "n": "Richard Abel Musgrave", "s": "Other", "h1": 49, "h2": 14, "ratio": 0.3 }, { "n": "Francis Ysidro Edgeworth", "s": "Neoclassical", "h1": 66, "h2": 28, "ratio": 0.4 }], "lag": [{ "n": "Francis Bacon", "b": 1561, "debut": 2e3, "lag": 439, "s": "Philosophy", "df": 5 }, { "n": "Thomas Hobbes", "b": 1588, "debut": 1998, "lag": 410, "s": "Philosophy", "df": 4 }, { "n": "John Locke", "b": 1632, "debut": 1995, "lag": 363, "s": "Philosophy", "df": 10 }, { "n": "Charles Davenant", "b": 1656, "debut": 2007, "lag": 351, "s": "Classical", "df": 2 }, { "n": "Richard Cantillon", "b": 1680, "debut": 2001, "lag": 321, "s": "Classical", "df": 3 }, { "n": "Daniel Bernoulli", "b": 1700, "debut": 1999, "lag": 299, "s": "Mathematical Economics", "df": 4 }, { "n": "David Hume", "b": 1711, "debut": 1997, "lag": 286, "s": "Classical", "df": 7 }, { "n": "Adam Smith", "b": 1723, "debut": 1980, "lag": 257, "s": "Classical", "df": 18 }, { "n": "Adam Ferguson", "b": 1723, "debut": 1997, "lag": 274, "s": "Classical", "df": 4 }, { "n": "Immanuel Kant", "b": 1724, "debut": 2003, "lag": 279, "s": "Philosophy", "df": 3 }, { "n": "Jeremy Bentham", "b": 1748, "debut": 1998, "lag": 250, "s": "Classical", "df": 2 }, { "n": "Georg Sartorius", "b": 1765, "debut": 1985, "lag": 220, "s": "Classical", "df": 4 }, { "n": "Wilhelm von Humboldt", "b": 1767, "debut": 2005, "lag": 238, "s": "Philosophy", "df": 3 }, { "n": "Georg Wilhelm Friedrich Hegel", "b": 1770, "debut": 2005, "lag": 235, "s": "Philosophy", "df": 3 }, { "n": "Johann Friedrich Eusebius Lotz", "b": 1771, "debut": 2005, "lag": 234, "s": "Classical", "df": 1 }, { "n": "David Ricardo", "b": 1772, "debut": 1980, "lag": 208, "s": "Classical", "df": 12 }, { "n": "Robert Torrens", "b": 1780, "debut": 1999, "lag": 219, "s": "Classical", "df": 3 }, { "n": "Georg von Buquoy", "b": 1781, "debut": 2001, "lag": 220, "s": "Other", "df": 2 }, { "n": "Johann Heinrich von Th\xFCnen", "b": 1783, "debut": 1985, "lag": 202, "s": "Raumwirtschaftslehre", "df": 7 }, { "n": "Friedrich List", "b": 1789, "debut": 1999, "lag": 210, "s": "National Economy", "df": 7 }, { "n": "Charles Babbage", "b": 1791, "debut": 1998, "lag": 207, "s": "Mathematical Economics", "df": 4 }, { "n": "Karl Heinrich Rau", "b": 1792, "debut": 1999, "lag": 207, "s": "Classical", "df": 5 }, { "n": "Friedrich Benedict Wilhelm von Hermann", "b": 1795, "debut": 1997, "lag": 202, "s": "Classical", "df": 5 }, { "n": "John Rae", "b": 1796, "debut": 1997, "lag": 201, "s": "Classical", "df": 2 }, { "n": "Carl Rodbertus-Jagetzow", "b": 1805, "debut": 2013, "lag": 208, "s": "Marxist", "df": 2 }, { "n": "John Stuart Mill", "b": 1806, "debut": 1980, "lag": 174, "s": "Classical", "df": 14 }, { "n": "Charles Robert Darwin", "b": 1809, "debut": 2007, "lag": 198, "s": "Other", "df": 2 }, { "n": "Bruno Hildebrand", "b": 1812, "debut": 1998, "lag": 186, "s": "Historical School", "df": 9 }, { "n": "Lorenz von Stein", "b": 1815, "debut": 1985, "lag": 170, "s": "Historical School", "df": 6 }, { "n": "Wilhelm Georg Friedrich Roscher", "b": 1817, "debut": 1982, "lag": 165, "s": "Historical School", "df": 13 }, { "n": "Karl Marx", "b": 1818, "debut": 1980, "lag": 162, "s": "Marxist", "df": 13 }, { "n": "Friedrich Engels", "b": 1820, "debut": 1990, "lag": 170, "s": "Marxist", "df": 6 }, { "n": "John Elliott Cairnes", "b": 1823, "debut": 1998, "lag": 175, "s": "Classical", "df": 3 }, { "n": "Walter Bagehot", "b": 1826, "debut": 1986, "lag": 160, "s": "Classical", "df": 4 }, { "n": "Hermann Roesler", "b": 1834, "debut": 1999, "lag": 165, "s": "Historical School", "df": 3 }, { "n": "William Stanley Jevons", "b": 1835, "debut": 1989, "lag": 154, "s": "Neoclassical", "df": 10 }, { "n": "Adolph Wagner", "b": 1835, "debut": 1985, "lag": 150, "s": "Historical School", "df": 7 }, { "n": "Eugen von Bergmann", "b": 1836, "debut": 2009, "lag": 173, "s": "Historical School", "df": 2 }, { "n": "Gustav von Schmoller", "b": 1838, "debut": 1985, "lag": 147, "s": "Historical School", "df": 10 }, { "n": "Carl Menger", "b": 1840, "debut": 1995, "lag": 155, "s": "Austrian School", "df": 14 }, { "n": "Gustav Cohn", "b": 1840, "debut": 1992, "lag": 152, "s": "Historical School", "df": 3 }, { "n": "Alfred Marshall", "b": 1842, "debut": 1980, "lag": 138, "s": "Neoclassical", "df": 18 }, { "n": "Georg Friedrich Knapp", "b": 1842, "debut": 1993, "lag": 151, "s": "Historical School", "df": 4 }, { "n": "Lujo Brentano", "b": 1844, "debut": 1994, "lag": 150, "s": "Historical School", "df": 8 }, { "n": "Friedrich Nietzsche", "b": 1844, "debut": 2013, "lag": 169, "s": "Philosophy", "df": 2 }, { "n": "Francis Ysidro Edgeworth", "b": 1845, "debut": 1985, "lag": 140, "s": "Neoclassical", "df": 6 }, { "n": "Karl B\xFCcher", "b": 1847, "debut": 2002, "lag": 155, "s": "Historical School", "df": 6 }, { "n": "Wilhelm Hasbach", "b": 1849, "debut": 2001, "lag": 152, "s": "Historical School", "df": 2 }, { "n": "Knut Wicksell", "b": 1851, "debut": 1992, "lag": 141, "s": "Neoclassical", "df": 13 }, { "n": "Eugen von B\xF6hm-Bawerk", "b": 1851, "debut": 1996, "lag": 145, "s": "Austrian School", "df": 11 }, { "n": "Friedrich von Wieser", "b": 1851, "debut": 1985, "lag": 134, "s": "Austrian School", "df": 6 }, { "n": "Arnold Toynbee", "b": 1852, "debut": 2e3, "lag": 148, "s": "Historical School", "df": 2 }, { "n": "Richard Ehrenberg", "b": 1857, "debut": 2e3, "lag": 143, "s": "Historical School", "df": 4 }, { "n": "Eugen von Philippovich", "b": 1858, "debut": 1995, "lag": 137, "s": "Austrian School", "df": 3 }, { "n": "Edmund Husserl", "b": 1859, "debut": 2021, "lag": 162, "s": "Philosophy", "df": 1 }, { "n": "Edwin Cannan", "b": 1861, "debut": 1997, "lag": 136, "s": "Classical", "df": 5 }, { "n": "Werner Sombart", "b": 1863, "debut": 1992, "lag": 129, "s": "Historical School", "df": 14 }, { "n": "Heinrich Herkner", "b": 1863, "debut": 1992, "lag": 129, "s": "Historical School", "df": 3 }, { "n": "Max Weber", "b": 1864, "debut": 1987, "lag": 123, "s": "Historical School", "df": 15 }, { "n": "Karl Diehl", "b": 1864, "debut": 1992, "lag": 128, "s": "Historical School", "df": 8 }, { "n": "Franz Oppenheimer", "b": 1864, "debut": 2001, "lag": 137, "s": "Historical School", "df": 3 }, { "n": "Karl Gustav Cassel", "b": 1866, "debut": 1992, "lag": 126, "s": "Neoclassical", "df": 12 }, { "n": "Ladislaus von Bortkiewicz", "b": 1868, "debut": 1994, "lag": 126, "s": "Mathematical Economics", "df": 6 }, { "n": "Rosa Luxemburg", "b": 1871, "debut": 2008, "lag": 137, "s": "Marxist", "df": 2 }, { "n": "Moritz Julius Bonn", "b": 1873, "debut": 1984, "lag": 111, "s": "Historical School", "df": 4 }, { "n": "Ernst Cassirer", "b": 1874, "debut": 2005, "lag": 131, "s": "Philosophy", "df": 1 }, { "n": "Arthur Cecil Pigou", "b": 1877, "debut": 1992, "lag": 115, "s": "Neoclassical", "df": 10 }, { "n": "Karl Pribram", "b": 1877, "debut": 2e3, "lag": 123, "s": "Austrian School", "df": 6 }, { "n": "Rudolf Hilferding", "b": 1877, "debut": 2009, "lag": 132, "s": "Marxist", "df": 3 }, { "n": "Hans Mayer", "b": 1879, "debut": 1985, "lag": 106, "s": "Austrian School", "df": 7 }, { "n": "Ralph George Hawtrey", "b": 1879, "debut": 1997, "lag": 118, "s": "Keynesian", "df": 4 }, { "n": "Eli Filip Heckscher", "b": 1879, "debut": 1985, "lag": 106, "s": "Neoclassical", "df": 4 }, { "n": "Franz Boese", "b": 1880, "debut": 2006, "lag": 126, "s": "Historical School", "df": 3 }, { "n": "Ludwig von Mises", "b": 1881, "debut": 1997, "lag": 116, "s": "Austrian School", "df": 9 }, { "n": "Otto Bauer", "b": 1881, "debut": 2001, "lag": 120, "s": "Marxist", "df": 5 }, { "n": "Frederick Lavington", "b": 1881, "debut": 1998, "lag": 117, "s": "Keynesian", "df": 3 }, { "n": "Joseph Alois Schumpeter", "b": 1883, "debut": 1982, "lag": 99, "s": "Evolutionary", "df": 28 }, { "n": "John Maynard Keynes", "b": 1883, "debut": 1983, "lag": 100, "s": "Keynesian", "df": 17 }, { "n": "Alfred Amonn", "b": 1883, "debut": 1992, "lag": 109, "s": "Classical", "df": 5 }, { "n": "Frank Hyneman Knight", "b": 1885, "debut": 1997, "lag": 112, "s": "Neoclassical", "df": 7 }, { "n": "Alvin Harvey Hansen", "b": 1887, "debut": 2004, "lag": 117, "s": "Keynesian", "df": 7 }, { "n": "Alexander Tschajanow", "b": 1888, "debut": 2003, "lag": 115, "s": "Other", "df": 1 }, { "n": "Gerhard Albrecht", "b": 1889, "debut": 2008, "lag": 119, "s": "Historical School", "df": 3 }, { "n": "Martin Heidegger", "b": 1889, "debut": 2002, "lag": 113, "s": "Philosophy", "df": 2 }, { "n": "Eduard Heimann", "b": 1889, "debut": 2001, "lag": 112, "s": "Other", "df": 2 }, { "n": "Walter Eucken", "b": 1891, "debut": 2003, "lag": 112, "s": "Ordoliberalismus", "df": 11 }, { "n": "Edgar Salin", "b": 1892, "debut": 1992, "lag": 100, "s": "Historical School", "df": 10 }, { "n": "Adolph Lowe", "b": 1893, "debut": 1994, "lag": 101, "s": "Institutional", "df": 6 }, { "n": "Andreas Pred\xF6hl", "b": 1893, "debut": 1987, "lag": 94, "s": "Raumwirtschaftslehre", "df": 3 }, { "n": "Walter Christaller", "b": 1893, "debut": 1987, "lag": 94, "s": "Raumwirtschaftslehre", "df": 2 }, { "n": "Karl Mannheim", "b": 1893, "debut": 2001, "lag": 108, "s": "Institutional", "df": 2 }, { "n": "Friedrich B\xFClow", "b": 1894, "debut": 2003, "lag": 109, "s": "Historical School", "df": 3 }, { "n": "Allan George Barnard Fisher", "b": 1895, "debut": 1993, "lag": 98, "s": "Development Economics", "df": 8 }, { "n": "Hans Philip Neisser", "b": 1895, "debut": 1992, "lag": 97, "s": "Austrian School", "df": 6 }, { "n": "Franz B\xF6hm", "b": 1895, "debut": 1994, "lag": 99, "s": "Ordoliberalismus", "df": 6 }, { "n": "Ragnar Anton Kittil Frisch", "b": 1895, "debut": 1998, "lag": 103, "s": "Mathematical Economics", "df": 5 }, { "n": "Jakob Baxa", "b": 1895, "debut": 2001, "lag": 106, "s": "Historical School", "df": 2 }, { "n": "Erich Gutenberg", "b": 1897, "debut": 2004, "lag": 107, "s": "Other", "df": 2 }, { "n": "Hans Ritschl", "b": 1897, "debut": 2008, "lag": 111, "s": "Historical School", "df": 1 }, { "n": "Piero Sraffa", "b": 1898, "debut": 1993, "lag": 95, "s": "Post-Keynesian/Sraffian", "df": 14 }, { "n": "Gunnar Myrdal", "b": 1898, "debut": 1997, "lag": 99, "s": "Institutional", "df": 7 }, { "n": "Howard Sylvester Ellis", "b": 1898, "debut": 1985, "lag": 87, "s": "Neoclassical", "df": 5 }, { "n": "Jacob Marschak", "b": 1898, "debut": 2005, "lag": 107, "s": "Mathematical Economics", "df": 4 }, { "n": "Friedrich August von Hayek", "b": 1899, "debut": 1985, "lag": 86, "s": "Austrian School", "df": 20 }, { "n": "Karl Brandt", "b": 1899, "debut": 1993, "lag": 94, "s": "Development Economics", "df": 10 }, { "n": "Wilhelm R\xF6pke", "b": 1899, "debut": 1992, "lag": 93, "s": "Ordoliberalismus", "df": 8 }, { "n": "Bertil Gotthard Ohlin", "b": 1899, "debut": 1985, "lag": 86, "s": "Neoclassical", "df": 3 }, { "n": "Erich Egner", "b": 1899, "debut": 2008, "lag": 109, "s": "Historical School", "df": 2 }, { "n": "Erich Carell", "b": 1899, "debut": 2003, "lag": 104, "s": "Neoclassical", "df": 2 }, { "n": "Erich Schneider", "b": 1900, "debut": 1985, "lag": 85, "s": "Neoclassical", "df": 10 }, { "n": "Gottfried von Haberler", "b": 1900, "debut": 1983, "lag": 83, "s": "Austrian School", "df": 9 }, { "n": "Fritz Neumark", "b": 1900, "debut": 1992, "lag": 92, "s": "Other", "df": 6 }, { "n": "Maurice Herbert Dobb", "b": 1900, "debut": 1994, "lag": 94, "s": "Marxist", "df": 5 }, { "n": "Friedrich August Lutz", "b": 1901, "debut": 2004, "lag": 103, "s": "Ordoliberalismus", "df": 5 }, { "n": "Simon Smith Kuznets", "b": 1901, "debut": 1994, "lag": 93, "s": "Development Economics", "df": 5 }, { "n": "Alfred M\xFCller-Armack", "b": 1901, "debut": 1996, "lag": 95, "s": "Ordoliberalismus", "df": 4 }, { "n": "Oskar Morgenstern", "b": 1902, "debut": 1992, "lag": 90, "s": "Austrian School", "df": 7 }, { "n": "Fritz Machlup", "b": 1902, "debut": 2004, "lag": 102, "s": "Austrian School", "df": 6 }, { "n": "Fritz Adolph Burchardt", "b": 1902, "debut": 1994, "lag": 92, "s": "Keynesian", "df": 5 }, { "n": "Karl Raimund Popper", "b": 1902, "debut": 1998, "lag": 96, "s": "Philosophy", "df": 3 }, { "n": "Joan Violet Robinson", "b": 1903, "debut": 1987, "lag": 84, "s": "Post-Keynesian/Sraffian", "df": 8 }, { "n": "Jan Tinbergen", "b": 1903, "debut": 1996, "lag": 93, "s": "Mathematical Economics", "df": 5 }, { "n": "Theodor W. Adorno", "b": 1903, "debut": 2009, "lag": 106, "s": "Philosophy", "df": 2 }, { "n": "John Richard Hicks", "b": 1904, "debut": 1989, "lag": 85, "s": "Neoclassical", "df": 13 }, { "n": "Wilhelm Abel", "b": 1904, "debut": 2001, "lag": 97, "s": "Historical School", "df": 5 }, { "n": "Alexander Gerschenkron", "b": 1904, "debut": 1999, "lag": 95, "s": "Development Economics", "df": 3 }, { "n": "Colin Clark", "b": 1905, "debut": 1993, "lag": 88, "s": "Development Economics", "df": 10 }, { "n": "Gerhard Stavenhagen", "b": 1905, "debut": 1985, "lag": 80, "s": "Historical School", "df": 5 }, { "n": "Heinrich von Stackelberg", "b": 1905, "debut": 2003, "lag": 98, "s": "Mathematical Economics", "df": 4 }, { "n": "Wassily Leontief", "b": 1905, "debut": 1994, "lag": 89, "s": "Mathematical Economics", "df": 3 }, { "n": "Roy George Douglas Allen", "b": 1906, "debut": 2001, "lag": 95, "s": "Mathematical Economics", "df": 6 }, { "n": "August L\xF6sch", "b": 1906, "debut": 1987, "lag": 81, "s": "Raumwirtschaftslehre", "df": 5 }, { "n": "Hannah Arendt", "b": 1906, "debut": 2006, "lag": 100, "s": "Philosophy", "df": 3 }, { "n": "Jean Fourasti\xE9", "b": 1907, "debut": 1999, "lag": 92, "s": "Development Economics", "df": 3 }, { "n": "Nicholas Kaldor", "b": 1908, "debut": 1997, "lag": 89, "s": "Post-Keynesian/Sraffian", "df": 6 }, { "n": "John Kenneth Galbraith", "b": 1908, "debut": 2001, "lag": 93, "s": "Institutional", "df": 2 }, { "n": "Wilhelm Treue", "b": 1909, "debut": 2005, "lag": 96, "s": "Historical School", "df": 3 }, { "n": "Werner Stark", "b": 1909, "debut": 1998, "lag": 89, "s": "Historical School", "df": 3 }, { "n": "Charles Poor Kindleberger", "b": 1910, "debut": 2007, "lag": 97, "s": "Development Economics", "df": 6 }, { "n": "Richard Abel Musgrave", "b": 1910, "debut": 1985, "lag": 75, "s": "Other", "df": 6 }, { "n": "Kenneth Ewart Boulding", "b": 1910, "debut": 2004, "lag": 94, "s": "Institutional", "df": 2 }, { "n": "George Joseph Stigler", "b": 1911, "debut": 1997, "lag": 86, "s": "Neoclassical", "df": 4 }, { "n": "Georg Peter Landmann", "b": 1911, "debut": 1992, "lag": 81, "s": "Philosophy", "df": 4 }, { "n": "Marian Bowley", "b": 1911, "debut": 1989, "lag": 78, "s": "Contemporary", "df": 2 }, { "n": "Otmar Emminger", "b": 1911, "debut": 2004, "lag": 93, "s": "Other", "df": 2 }, { "n": "Milton Friedman", "b": 1912, "debut": 1983, "lag": 71, "s": "Neoclassical", "df": 11 }, { "n": "Terence Wilmot Hutchison", "b": 1912, "debut": 1983, "lag": 71, "s": "Philosophy", "df": 7 }, { "n": "John Richard Nicholas Stone", "b": 1913, "debut": 2007, "lag": 94, "s": "Mathematical Economics", "df": 3 }, { "n": "Lewis A. Coser", "b": 1913, "debut": 2004, "lag": 91, "s": "Other", "df": 2 }, { "n": "Paul Anthony Samuelson", "b": 1915, "debut": 1980, "lag": 65, "s": "Neoclassical", "df": 18 }, { "n": "Albert Otto Hirschman", "b": 1915, "debut": 2010, "lag": 95, "s": "Development Economics", "df": 4 }, { "n": "Hans Brems", "b": 1915, "debut": 2e3, "lag": 85, "s": "Neoclassical", "df": 3 }, { "n": "Herbert Alexander Simon", "b": 1916, "debut": 1998, "lag": 82, "s": "Institutional", "df": 7 }, { "n": "Wilhelm Krelle", "b": 1916, "debut": 1993, "lag": 77, "s": "Mathematical Economics", "df": 5 }, { "n": "Karl Brunner", "b": 1916, "debut": 2004, "lag": 88, "s": "Neoclassical", "df": 4 }, { "n": "Robert Dorfman", "b": 1916, "debut": 2003, "lag": 87, "s": "Mathematical Economics", "df": 4 }, { "n": "J\xFCrg Niehans", "b": 1919, "debut": 1993, "lag": 74, "s": "Neoclassical", "df": 10 }, { "n": "James McGill Buchanan", "b": 1919, "debut": 1992, "lag": 73, "s": "Institutional", "df": 9 }, { "n": "Walter Adolf J\xF6hr", "b": 1919, "debut": 2019, "lag": 100, "s": "Keynesian", "df": 2 }, { "n": "Karl H\xE4user", "b": 1920, "debut": 1990, "lag": 70, "s": "Contemporary", "df": 8 }, { "n": "Kenneth Joseph Arrow", "b": 1921, "debut": 2002, "lag": 81, "s": "Mathematical Economics", "df": 5 }, { "n": "Herbert Giersch", "b": 1921, "debut": 2002, "lag": 81, "s": "Neoclassical", "df": 4 }, { "n": "John Rawls", "b": 1921, "debut": 1998, "lag": 77, "s": "Philosophy", "df": 2 }, { "n": "William Jack Baumol", "b": 1922, "debut": 1980, "lag": 58, "s": "Neoclassical", "df": 9 }, { "n": "Don Patinkin", "b": 1922, "debut": 1983, "lag": 61, "s": "Keynesian", "df": 6 }, { "n": "Alfred B\xFCrgin", "b": 1922, "debut": 2001, "lag": 79, "s": "Historical School", "df": 4 }, { "n": "Thomas Samuel Kuhn", "b": 1922, "debut": 1994, "lag": 72, "s": "Philosophy", "df": 4 }, { "n": "Michio Morishima", "b": 1923, "debut": 1993, "lag": 70, "s": "Mathematical Economics", "df": 4 }, { "n": "Harry Gordon Johnson", "b": 1923, "debut": 1998, "lag": 75, "s": "Neoclassical", "df": 3 }, { "n": "Mark Perlman", "b": 1923, "debut": 2001, "lag": 78, "s": "Institutional", "df": 2 }, { "n": "Wilhelm Hennis", "b": 1923, "debut": 2009, "lag": 86, "s": "Philosophy", "df": 2 }, { "n": "Reinhart Koselleck", "b": 1923, "debut": 2012, "lag": 89, "s": "Philosophy", "df": 2 }, { "n": "Robert Merton Solow", "b": 1924, "debut": 1998, "lag": 74, "s": "Neoclassical", "df": 9 }, { "n": "Ernst Helmst\xE4dter", "b": 1924, "debut": 1993, "lag": 69, "s": "Contemporary", "df": 9 }, { "n": "David Saul Landes", "b": 1924, "debut": 2e3, "lag": 76, "s": "Historical School", "df": 4 }, { "n": "Robert V. Eagly", "b": 1925, "debut": 1982, "lag": 57, "s": "Historical School", "df": 3 }, { "n": "Knut Borchardt", "b": 1926, "debut": 2004, "lag": 78, "s": "Historical School", "df": 7 }, { "n": "John Somerset Chipman", "b": 1926, "debut": 1999, "lag": 73, "s": "Neoclassical", "df": 5 }, { "n": "Rudolf Richter", "b": 1926, "debut": 1998, "lag": 72, "s": "Institutional", "df": 5 }, { "n": "Eckart Schremmer", "b": 1926, "debut": 2004, "lag": 78, "s": "Historical School", "df": 2 }, { "n": "Mark Blaug", "b": 1927, "debut": 1980, "lag": 53, "s": "Contemporary", "df": 17 }, { "n": "Niklas Luhmann", "b": 1927, "debut": 2008, "lag": 81, "s": "Other", "df": 3 }, { "n": "Harald Winkel", "b": 1928, "debut": 1982, "lag": 54, "s": "Historical School", "df": 8 }, { "n": "Hans Christoph Binswanger", "b": 1929, "debut": 1998, "lag": 69, "s": "Evolutionary", "df": 4 }, { "n": "Peter Bernholz", "b": 1929, "debut": 1985, "lag": 56, "s": "Contemporary", "df": 4 }, { "n": "Edwin von B\xF6venter", "b": 1929, "debut": 2006, "lag": 77, "s": "Raumwirtschaftslehre", "df": 3 }, { "n": "J\xFCrgen Habermas", "b": 1929, "debut": 2e3, "lag": 71, "s": "Philosophy", "df": 2 }, { "n": "Israel Meir Kirzner", "b": 1930, "debut": 1997, "lag": 67, "s": "Austrian School", "df": 5 }, { "n": "Luigi Lodovico Pasinetti", "b": 1930, "debut": 1998, "lag": 68, "s": "Post-Keynesian/Sraffian", "df": 5 }, { "n": "Pierangelo Garegnani", "b": 1930, "debut": 1997, "lag": 67, "s": "Post-Keynesian/Sraffian", "df": 4 }, { "n": "Paul Davidson", "b": 1930, "debut": 2004, "lag": 74, "s": "Post-Keynesian/Sraffian", "df": 4 }, { "n": "Karl Heinrich Kaufhold", "b": 1931, "debut": 2006, "lag": 75, "s": "Historical School", "df": 3 }, { "n": "Erich Wolfgang Streissler", "b": 1933, "debut": 1993, "lag": 60, "s": "Austrian School", "df": 12 }, { "n": "Axel Leijonhufvud", "b": 1933, "debut": 1983, "lag": 50, "s": "Keynesian", "df": 8 }, { "n": "Takashi Negishi", "b": 1933, "debut": 1997, "lag": 64, "s": "Neoclassical", "df": 4 }, { "n": "Hajo Riese", "b": 1934, "debut": 1983, "lag": 49, "s": "Post-Keynesian/Sraffian", "df": 5 }, { "n": "Knut Wolfgang N\xF6rr", "b": 1935, "debut": 2009, "lag": 74, "s": "Ordoliberalismus", "df": 1 }, { "n": "Robert Emerson Lucas Jr.", "b": 1937, "debut": 2004, "lag": 67, "s": "Neoclassical", "df": 7 }, { "n": "Klaus Hinrich Hennings", "b": 1937, "debut": 1995, "lag": 58, "s": "Austrian School", "df": 6 }, { "n": "Erwin Weissel", "b": 1937, "debut": 2009, "lag": 72, "s": "Marxist", "df": 1 }, { "n": "David Ernest William Laidler", "b": 1938, "debut": 1983, "lag": 45, "s": "Contemporary", "df": 7 }, { "n": "Heinz Grossekettler", "b": 1938, "debut": 1997, "lag": 59, "s": "Ordoliberalismus", "df": 4 }, { "n": "Peter Groenewegen", "b": 1939, "debut": 1993, "lag": 54, "s": "Contemporary", "df": 4 }, { "n": "Christopher Bliss", "b": 1940, "debut": 2007, "lag": 67, "s": "Neoclassical", "df": 2 }, { "n": "Michael Ruse", "b": 1940, "debut": 2005, "lag": 65, "s": "Philosophy", "df": 1 }, { "n": "Ian Steedman", "b": 1941, "debut": 1997, "lag": 56, "s": "Post-Keynesian/Sraffian", "df": 4 }, { "n": "Peter Kalmbach", "b": 1941, "debut": 2011, "lag": 70, "s": "Post-Keynesian/Sraffian", "df": 3 }, { "n": "Wolf Sch\xE4fer", "b": 1942, "debut": 2004, "lag": 62, "s": "Contemporary", "df": 3 }, { "n": "Joseph Eugene Stiglitz", "b": 1943, "debut": 2004, "lag": 61, "s": "Contemporary", "df": 8 }, { "n": "E. Roy Weintraub", "b": 1943, "debut": 2001, "lag": 58, "s": "Mathematical Economics", "df": 4 }, { "n": "Lars Jonung", "b": 1944, "debut": 1997, "lag": 53, "s": "Contemporary", "df": 3 }, { "n": "Jan Allen Kregel", "b": 1944, "debut": 2004, "lag": 60, "s": "Post-Keynesian/Sraffian", "df": 2 }, { "n": "Filippo Cesarano", "b": 1944, "debut": 1998, "lag": 54, "s": "Contemporary", "df": 2 }, { "n": "Sergio Cremaschi", "b": 1945, "debut": 2014, "lag": 69, "s": "Philosophy", "df": 2 }, { "n": "Joel Mokyr", "b": 1946, "debut": 2012, "lag": 66, "s": "Evolutionary", "df": 3 }, { "n": "Geoffrey Martin Hodgson", "b": 1946, "debut": 2012, "lag": 66, "s": "Institutional", "df": 3 }, { "n": "Anthony Brewer", "b": 1946, "debut": 2008, "lag": 62, "s": "Contemporary", "df": 2 }, { "n": "Istv\xE1n Hont", "b": 1947, "debut": 2003, "lag": 56, "s": "Historical School", "df": 2 }, { "n": "Joel Kaye", "b": 1947, "debut": 2e3, "lag": 53, "s": "Philosophy", "df": 2 }, { "n": "Michael Hutter", "b": 1947, "debut": 2018, "lag": 71, "s": "Evolutionary", "df": 1 }, { "n": "Richard Swedberg", "b": 1948, "debut": 2001, "lag": 53, "s": "Institutional", "df": 4 }, { "n": "Keith Tribe", "b": 1949, "debut": 1994, "lag": 45, "s": "Historical School", "df": 9 }, { "n": "J\xFCrgen Backhaus", "b": 1950, "debut": 1996, "lag": 46, "s": "Institutional", "df": 7 }, { "n": "Ulrich van Suntum", "b": 1950, "debut": 1993, "lag": 43, "s": "Ordoliberalismus", "df": 3 }, { "n": "Don Lavoie", "b": 1951, "debut": 2005, "lag": 54, "s": "Austrian School", "df": 3 }, { "n": "Uskali M\xE4ki", "b": 1951, "debut": 2001, "lag": 50, "s": "Philosophy", "df": 3 }, { "n": "Paul Robin Krugman", "b": 1953, "debut": 2007, "lag": 54, "s": "Raumwirtschaftslehre", "df": 8 }, { "n": "John Geanakoplos", "b": 1955, "debut": 2005, "lag": 50, "s": "Mathematical Economics", "df": 2 }, { "n": "Bradley W. Bateman", "b": 1956, "debut": 2007, "lag": 51, "s": "Keynesian", "df": 2 }, { "n": "Christos Baloglou", "b": 1956, "debut": 1999, "lag": 43, "s": "Other", "df": 2 }, { "n": "Helge Peukert", "b": 1961, "debut": 2e3, "lag": 39, "s": "Institutional", "df": 7 }, { "n": "J\xF6rg Bibow", "b": 1963, "debut": 2004, "lag": 41, "s": "Post-Keynesian/Sraffian", "df": 3 }, { "n": "Daniele Besomi", "b": 1963, "debut": 2001, "lag": 38, "s": "Contemporary", "df": 3 }, { "n": "Nicolai Juul Foss", "b": 1964, "debut": 2002, "lag": 38, "s": "Evolutionary", "df": 2 }, { "n": "Charles I. Jones", "b": 1968, "debut": 1998, "lag": 30, "s": "Contemporary", "df": 6 }, { "n": "Hans J\xF6rg Hennecke", "b": 1969, "debut": 2016, "lag": 47, "s": "Contemporary", "df": 2 }], "ded": [{ "n": "Walter Christaller", "s": "Raumwirtschaftslehre", "peak": 2008, "pct": 95, "total": 66, "df": 2, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Erich Gutenberg", "s": "Other", "peak": 2004, "pct": 92, "total": 63, "df": 2, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Andreas Pred\xF6hl", "s": "Raumwirtschaftslehre", "peak": 2008, "pct": 89, "total": 57, "df": 3, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Jeremy Bentham", "s": "Classical", "peak": 1998, "pct": 89, "total": 73, "df": 2, "theme": "John Stuart Mill" }, { "n": "John Stuart Mill", "s": "Classical", "peak": 1998, "pct": 84, "total": 647, "df": 14, "theme": "John Stuart Mill" }, { "n": "Don Patinkin", "s": "Keynesian", "peak": 2019, "pct": 81, "total": 175, "df": 6, "theme": "\xD6konomie und Evolution" }, { "n": "Richard Ehrenberg", "s": "Historical School", "peak": 2004, "pct": 81, "total": 58, "df": 4, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Franz Boese", "s": "Historical School", "peak": 2021, "pct": 80, "total": 66, "df": 3, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Charles Robert Darwin", "s": "Other", "peak": 2016, "pct": 80, "total": 51, "df": 2, "theme": "Stagnations- und Deflationsthe" }, { "n": "Georg von Buquoy", "s": "Other", "peak": 2002, "pct": 79, "total": 39, "df": 2, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Heinrich von Stackelberg", "s": "Mathematical Economics", "peak": 2003, "pct": 78, "total": 78, "df": 4, "theme": "\xD6konomie und Religion" }, { "n": "Geoffrey Martin Hodgson", "s": "Institutional", "peak": 2016, "pct": 78, "total": 119, "df": 3, "theme": "Stagnations- und Deflationsthe" }, { "n": "Istv\xE1n Hont", "s": "Historical School", "peak": 2018, "pct": 78, "total": 23, "df": 2, "theme": "Kameralismus und Merkantilismu" }, { "n": "Marian Bowley", "s": "Contemporary", "peak": 1989, "pct": 75, "total": 20, "df": 2, "theme": "Friedrich List; Carl Menger; L" }, { "n": "Georg Friedrich Knapp", "s": "Historical School", "peak": 2019, "pct": 70, "total": 56, "df": 4, "theme": "\xD6konomie und Evolution" }, { "n": "Fritz Neumark", "s": "Other", "peak": 2004, "pct": 69, "total": 119, "df": 6, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "J\xF6rg Bibow", "s": "Post-Keynesian/Sraffian", "peak": 2004, "pct": 69, "total": 49, "df": 3, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Rudolf Hilferding", "s": "Marxist", "peak": 2019, "pct": 68, "total": 40, "df": 3, "theme": "\xD6konomie und Evolution" }, { "n": "Herbert Giersch", "s": "Neoclassical", "peak": 2004, "pct": 67, "total": 39, "df": 4, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Wolf Sch\xE4fer", "s": "Contemporary", "peak": 2004, "pct": 67, "total": 30, "df": 3, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Nicolai Juul Foss", "s": "Evolutionary", "peak": 2007, "pct": 67, "total": 24, "df": 2, "theme": "Wechselseitige Einfl\xFCsse" }, { "n": "Joel Mokyr", "s": "Evolutionary", "peak": 2012, "pct": 66, "total": 47, "df": 3, "theme": "Zeit um den Ersten Weltkrieg" }, { "n": "Erich Schneider", "s": "Neoclassical", "peak": 2004, "pct": 65, "total": 221, "df": 10, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Hajo Riese", "s": "Post-Keynesian/Sraffian", "peak": 2004, "pct": 65, "total": 60, "df": 5, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Friedrich B\xFClow", "s": "Historical School", "peak": 2008, "pct": 65, "total": 52, "df": 3, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Gerhard Albrecht", "s": "Historical School", "peak": 2021, "pct": 65, "total": 23, "df": 3, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Peter Kalmbach", "s": "Post-Keynesian/Sraffian", "peak": 2015, "pct": 64, "total": 22, "df": 3, "theme": "Kontinuit\xE4t und Wandel in der " }, { "n": "Joel Kaye", "s": "Philosophy", "peak": 2e3, "pct": 64, "total": 22, "df": 2, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Karl Brunner", "s": "Neoclassical", "peak": 2011, "pct": 63, "total": 63, "df": 4, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Karl Raimund Popper", "s": "Philosophy", "peak": 1998, "pct": 62, "total": 52, "df": 3, "theme": "John Stuart Mill" }, { "n": "Frederick Lavington", "s": "Keynesian", "peak": 2019, "pct": 62, "total": 26, "df": 3, "theme": "\xD6konomie und Evolution" }, { "n": "Niklas Luhmann", "s": "Other", "peak": 2018, "pct": 61, "total": 33, "df": 3, "theme": "Kameralismus und Merkantilismu" }, { "n": "Gunnar Myrdal", "s": "Institutional", "peak": 2010, "pct": 60, "total": 139, "df": 7, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Bruno Hildebrand", "s": "Historical School", "peak": 1999, "pct": 59, "total": 172, "df": 9, "theme": "Die \xC4ltere Historische Schule" }, { "n": "Harry Gordon Johnson", "s": "Neoclassical", "peak": 2011, "pct": 59, "total": 32, "df": 3, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Immanuel Kant", "s": "Philosophy", "peak": 2016, "pct": 59, "total": 27, "df": 3, "theme": "Stagnations- und Deflationsthe" }, { "n": "Hans Christoph Binswanger", "s": "Evolutionary", "peak": 2018, "pct": 58, "total": 31, "df": 4, "theme": "Kameralismus und Merkantilismu" }, { "n": "Wilhelm R\xF6pke", "s": "Ordoliberalismus", "peak": 2004, "pct": 57, "total": 293, "df": 8, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Alvin Harvey Hansen", "s": "Keynesian", "peak": 2017, "pct": 57, "total": 67, "df": 7, "theme": "Einkommens- und Verm\xF6gensverte" }, { "n": "Oskar Morgenstern", "s": "Austrian School", "peak": 2019, "pct": 56, "total": 81, "df": 7, "theme": "\xD6konomie und Evolution" }, { "n": "Fritz Machlup", "s": "Austrian School", "peak": 2005, "pct": 56, "total": 80, "df": 6, "theme": "German\u2013American Economic Thoug" }, { "n": "Daniel Bernoulli", "s": "Mathematical Economics", "peak": 2007, "pct": 56, "total": 41, "df": 4, "theme": "Wechselseitige Einfl\xFCsse" }, { "n": "Heinrich Herkner", "s": "Historical School", "peak": 2021, "pct": 56, "total": 39, "df": 3, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Francis Ysidro Edgeworth", "s": "Neoclassical", "peak": 1998, "pct": 54, "total": 94, "df": 6, "theme": "John Stuart Mill" }, { "n": "Thomas Samuel Kuhn", "s": "Philosophy", "peak": 2016, "pct": 54, "total": 24, "df": 4, "theme": "Stagnations- und Deflationsthe" }, { "n": "Mark Perlman", "s": "Institutional", "peak": 2001, "pct": 54, "total": 35, "df": 2, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Lars Jonung", "s": "Contemporary", "peak": 1997, "pct": 53, "total": 30, "df": 3, "theme": "Knut Wicksell" }, { "n": "Bertil Gotthard Ohlin", "s": "Neoclassical", "peak": 2008, "pct": 53, "total": 30, "df": 3, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Kenneth Joseph Arrow", "s": "Mathematical Economics", "peak": 2005, "pct": 52, "total": 82, "df": 5, "theme": "German\u2013American Economic Thoug" }, { "n": "Jean Fourasti\xE9", "s": "Development Economics", "peak": 2013, "pct": 52, "total": 21, "df": 3, "theme": "Marx und Engels \u2014 Neue Perspek" }, { "n": "Adolph Wagner", "s": "Historical School", "peak": 1992, "pct": 51, "total": 88, "df": 7, "theme": "Deutsche Finanzwissenschaft zw" }, { "n": "Johann Heinrich von Th\xFCnen", "s": "Raumwirtschaftslehre", "peak": 2008, "pct": 51, "total": 47, "df": 7, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Hans Philip Neisser", "s": "Austrian School", "peak": 2019, "pct": 50, "total": 243, "df": 6, "theme": "\xD6konomie und Evolution" }, { "n": "Fritz Adolph Burchardt", "s": "Keynesian", "peak": 2019, "pct": 50, "total": 52, "df": 5, "theme": "\xD6konomie und Evolution" }, { "n": "Walter Bagehot", "s": "Classical", "peak": 1998, "pct": 50, "total": 26, "df": 4, "theme": "John Stuart Mill" }, { "n": "John Richard Nicholas Stone", "s": "Mathematical Economics", "peak": 2012, "pct": 50, "total": 28, "df": 3, "theme": "Zeit um den Ersten Weltkrieg" }, { "n": "Werner Stark", "s": "Historical School", "peak": 2001, "pct": 50, "total": 22, "df": 3, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Roy George Douglas Allen", "s": "Mathematical Economics", "peak": 2016, "pct": 49, "total": 51, "df": 6, "theme": "Stagnations- und Deflationsthe" }, { "n": "Robert Dorfman", "s": "Mathematical Economics", "peak": 2011, "pct": 49, "total": 47, "df": 4, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Alfred M\xFCller-Armack", "s": "Ordoliberalismus", "peak": 2e3, "pct": 48, "total": 21, "df": 4, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Moritz Julius Bonn", "s": "Historical School", "peak": 2019, "pct": 48, "total": 21, "df": 4, "theme": "\xD6konomie und Evolution" }, { "n": "Don Lavoie", "s": "Austrian School", "peak": 2007, "pct": 48, "total": 25, "df": 3, "theme": "Wechselseitige Einfl\xFCsse" }, { "n": "Wassily Leontief", "s": "Mathematical Economics", "peak": 2002, "pct": 48, "total": 21, "df": 3, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Howard Sylvester Ellis", "s": "Neoclassical", "peak": 2019, "pct": 47, "total": 51, "df": 5, "theme": "\xD6konomie und Evolution" }, { "n": "Richard Abel Musgrave", "s": "Other", "peak": 1998, "pct": 46, "total": 63, "df": 6, "theme": "John Stuart Mill" }, { "n": "Friedrich August Lutz", "s": "Ordoliberalismus", "peak": 2015, "pct": 46, "total": 57, "df": 5, "theme": "Kontinuit\xE4t und Wandel in der " }, { "n": "Paul Robin Krugman", "s": "Raumwirtschaftslehre", "peak": 2010, "pct": 45, "total": 244, "df": 8, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "David Hume", "s": "Classical", "peak": 2018, "pct": 45, "total": 62, "df": 7, "theme": "Kameralismus und Merkantilismu" }, { "n": "Alfred Amonn", "s": "Classical", "peak": 1992, "pct": 44, "total": 61, "df": 5, "theme": "Deutsche Finanzwissenschaft zw" }, { "n": "Edgar Salin", "s": "Historical School", "peak": 2005, "pct": 43, "total": 104, "df": 10, "theme": "German\u2013American Economic Thoug" }, { "n": "Karl Heinrich Kaufhold", "s": "Historical School", "peak": 2006, "pct": 43, "total": 35, "df": 3, "theme": "Wissen / The Knowledge Economy" }, { "n": "Simon Smith Kuznets", "s": "Development Economics", "peak": 2001, "pct": 42, "total": 38, "df": 5, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Alfred B\xFCrgin", "s": "Historical School", "peak": 2018, "pct": 42, "total": 50, "df": 4, "theme": "Kameralismus und Merkantilismu" }, { "n": "Albert Otto Hirschman", "s": "Development Economics", "peak": 2018, "pct": 42, "total": 50, "df": 4, "theme": "Kameralismus und Merkantilismu" }, { "n": "Eugen von B\xF6hm-Bawerk", "s": "Austrian School", "peak": 2015, "pct": 41, "total": 133, "df": 11, "theme": "Kontinuit\xE4t und Wandel in der " }, { "n": "Friedrich Engels", "s": "Marxist", "peak": 1999, "pct": 41, "total": 41, "df": 6, "theme": "Die \xC4ltere Historische Schule" }, { "n": "John Somerset Chipman", "s": "Neoclassical", "peak": 2010, "pct": 41, "total": 39, "df": 5, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Rudolf Richter", "s": "Institutional", "peak": 2004, "pct": 41, "total": 46, "df": 5, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "George Joseph Stigler", "s": "Neoclassical", "peak": 2002, "pct": 41, "total": 39, "df": 4, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Luigi Lodovico Pasinetti", "s": "Post-Keynesian/Sraffian", "peak": 2014, "pct": 40, "total": 48, "df": 5, "theme": "Macht oder \xF6konomisches Gesetz" }, { "n": "Heinz Grossekettler", "s": "Ordoliberalismus", "peak": 2004, "pct": 40, "total": 30, "df": 4, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Ralph George Hawtrey", "s": "Keynesian", "peak": 1997, "pct": 40, "total": 35, "df": 4, "theme": "Knut Wicksell" }, { "n": "Erich Wolfgang Streissler", "s": "Austrian School", "peak": 1995, "pct": 39, "total": 115, "df": 12, "theme": "Umsetzung wirtschaftspolitisch" }, { "n": "Hans Mayer", "s": "Austrian School", "peak": 2009, "pct": 39, "total": 62, "df": 7, "theme": "Geschichte der Entwicklungsthe" }, { "n": "Georg Peter Landmann", "s": "Philosophy", "peak": 1992, "pct": 39, "total": 61, "df": 4, "theme": "Deutsche Finanzwissenschaft zw" }, { "n": "Adolph Lowe", "s": "Institutional", "peak": 2010, "pct": 38, "total": 42, "df": 6, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Richard Swedberg", "s": "Institutional", "peak": 2001, "pct": 38, "total": 21, "df": 4, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "E. Roy Weintraub", "s": "Mathematical Economics", "peak": 2001, "pct": 38, "total": 21, "df": 4, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Eli Filip Heckscher", "s": "Neoclassical", "peak": 2012, "pct": 38, "total": 34, "df": 4, "theme": "Zeit um den Ersten Weltkrieg" }, { "n": "Georg Sartorius", "s": "Classical", "peak": 1985, "pct": 38, "total": 39, "df": 4, "theme": "Entwicklungen der deutschsprac" }, { "n": "Thomas Hobbes", "s": "Philosophy", "peak": 1998, "pct": 38, "total": 24, "df": 4, "theme": "John Stuart Mill" }, { "n": "Edwin von B\xF6venter", "s": "Raumwirtschaftslehre", "peak": 2008, "pct": 38, "total": 21, "df": 3, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Hans Brems", "s": "Neoclassical", "peak": 2002, "pct": 38, "total": 21, "df": 3, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Walter Eucken", "s": "Ordoliberalismus", "peak": 2010, "pct": 37, "total": 315, "df": 11, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "David Saul Landes", "s": "Historical School", "peak": 2012, "pct": 37, "total": 41, "df": 4, "theme": "Zeit um den Ersten Weltkrieg" }, { "n": "Jacob Marschak", "s": "Mathematical Economics", "peak": 2005, "pct": 37, "total": 35, "df": 4, "theme": "German\u2013American Economic Thoug" }, { "n": "Milton Friedman", "s": "Neoclassical", "peak": 2011, "pct": 36, "total": 167, "df": 11, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Joan Violet Robinson", "s": "Post-Keynesian/Sraffian", "peak": 2010, "pct": 36, "total": 59, "df": 8, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Klaus Hinrich Hennings", "s": "Austrian School", "peak": 2004, "pct": 36, "total": 50, "df": 6, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "August L\xF6sch", "s": "Raumwirtschaftslehre", "peak": 2008, "pct": 36, "total": 121, "df": 5, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Otto Bauer", "s": "Marxist", "peak": 2001, "pct": 36, "total": 45, "df": 5, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Paul Davidson", "s": "Post-Keynesian/Sraffian", "peak": 2019, "pct": 35, "total": 23, "df": 4, "theme": "\xD6konomie und Evolution" }, { "n": "Robert Emerson Lucas Jr.", "s": "Neoclassical", "peak": 2005, "pct": 34, "total": 65, "df": 7, "theme": "German\u2013American Economic Thoug" }, { "n": "Ragnar Anton Kittil Frisch", "s": "Mathematical Economics", "peak": 1998, "pct": 34, "total": 44, "df": 5, "theme": "John Stuart Mill" }, { "n": "Max Weber", "s": "Historical School", "peak": 2e3, "pct": 33, "total": 141, "df": 15, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Karl Diehl", "s": "Historical School", "peak": 2011, "pct": 33, "total": 72, "df": 8, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Ladislaus von Bortkiewicz", "s": "Mathematical Economics", "peak": 2009, "pct": 33, "total": 30, "df": 6, "theme": "Geschichte der Entwicklungsthe" }, { "n": "Gerhard Stavenhagen", "s": "Historical School", "peak": 1985, "pct": 33, "total": 27, "df": 5, "theme": "Entwicklungen der deutschsprac" }, { "n": "Jan Tinbergen", "s": "Mathematical Economics", "peak": 2003, "pct": 33, "total": 33, "df": 5, "theme": "\xD6konomie und Religion" }, { "n": "Ian Steedman", "s": "Post-Keynesian/Sraffian", "peak": 2010, "pct": 33, "total": 27, "df": 4, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Peter Groenewegen", "s": "Contemporary", "peak": 2016, "pct": 33, "total": 24, "df": 4, "theme": "Stagnations- und Deflationsthe" }, { "n": "Michio Morishima", "s": "Mathematical Economics", "peak": 2e3, "pct": 33, "total": 24, "df": 4, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Ernst Helmst\xE4dter", "s": "Contemporary", "peak": 2001, "pct": 32, "total": 78, "df": 9, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Charles Babbage", "s": "Mathematical Economics", "peak": 2002, "pct": 32, "total": 31, "df": 4, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Charles I. Jones", "s": "Contemporary", "peak": 2005, "pct": 31, "total": 35, "df": 6, "theme": "German\u2013American Economic Thoug" }, { "n": "Pierangelo Garegnani", "s": "Post-Keynesian/Sraffian", "peak": 1998, "pct": 31, "total": 26, "df": 4, "theme": "John Stuart Mill" }, { "n": "Gottfried von Haberler", "s": "Austrian School", "peak": 2019, "pct": 30, "total": 88, "df": 9, "theme": "\xD6konomie und Evolution" }, { "n": "Karl H\xE4user", "s": "Contemporary", "peak": 2004, "pct": 30, "total": 94, "df": 8, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "David Ernest William Laidler", "s": "Contemporary", "peak": 1997, "pct": 30, "total": 73, "df": 7, "theme": "Knut Wicksell" }, { "n": "Karl B\xFCcher", "s": "Historical School", "peak": 2021, "pct": 30, "total": 44, "df": 6, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Friedrich August von Hayek", "s": "Austrian School", "peak": 2019, "pct": 29, "total": 719, "df": 20, "theme": "\xD6konomie und Evolution" }, { "n": "Colin Clark", "s": "Development Economics", "peak": 2011, "pct": 29, "total": 101, "df": 10, "theme": "Entwicklung der Raumwirtschaft" }, { "n": "Maurice Herbert Dobb", "s": "Marxist", "peak": 2010, "pct": 29, "total": 28, "df": 5, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Francis Bacon", "s": "Philosophy", "peak": 2e3, "pct": 29, "total": 28, "df": 5, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "David Ricardo", "s": "Classical", "peak": 2007, "pct": 28, "total": 147, "df": 12, "theme": "Wechselseitige Einfl\xFCsse" }, { "n": "Arthur Cecil Pigou", "s": "Neoclassical", "peak": 1998, "pct": 28, "total": 82, "df": 10, "theme": "John Stuart Mill" }, { "n": "Lujo Brentano", "s": "Historical School", "peak": 2021, "pct": 28, "total": 65, "df": 8, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Lorenz von Stein", "s": "Historical School", "peak": 2013, "pct": 28, "total": 40, "df": 6, "theme": "Marx und Engels \u2014 Neue Perspek" }, { "n": "Wilhelm Krelle", "s": "Mathematical Economics", "peak": 2015, "pct": 28, "total": 29, "df": 5, "theme": "Kontinuit\xE4t und Wandel in der " }, { "n": "Edwin Cannan", "s": "Classical", "peak": 1998, "pct": 28, "total": 39, "df": 5, "theme": "John Stuart Mill" }, { "n": "Takashi Negishi", "s": "Neoclassical", "peak": 1997, "pct": 28, "total": 29, "df": 4, "theme": "Knut Wicksell" }, { "n": "Knut Borchardt", "s": "Historical School", "peak": 2004, "pct": 27, "total": 70, "df": 7, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Knut Wicksell", "s": "Neoclassical", "peak": 1997, "pct": 26, "total": 223, "df": 13, "theme": "Knut Wicksell" }, { "n": "Joseph Eugene Stiglitz", "s": "Contemporary", "peak": 2004, "pct": 26, "total": 31, "df": 8, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Helge Peukert", "s": "Institutional", "peak": 2004, "pct": 26, "total": 31, "df": 7, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Herbert Alexander Simon", "s": "Institutional", "peak": 2019, "pct": 26, "total": 34, "df": 7, "theme": "\xD6konomie und Evolution" }, { "n": "Nicholas Kaldor", "s": "Post-Keynesian/Sraffian", "peak": 2002, "pct": 26, "total": 50, "df": 6, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Franz B\xF6hm", "s": "Ordoliberalismus", "peak": 2004, "pct": 26, "total": 42, "df": 6, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Karl Pribram", "s": "Austrian School", "peak": 2e3, "pct": 26, "total": 43, "df": 6, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Friedrich von Wieser", "s": "Austrian School", "peak": 1999, "pct": 26, "total": 53, "df": 6, "theme": "Die \xC4ltere Historische Schule" }, { "n": "Wilhelm Abel", "s": "Historical School", "peak": 2003, "pct": 26, "total": 43, "df": 5, "theme": "\xD6konomie und Religion" }, { "n": "William Jack Baumol", "s": "Neoclassical", "peak": 2013, "pct": 25, "total": 65, "df": 9, "theme": "Marx und Engels \u2014 Neue Perspek" }, { "n": "Israel Meir Kirzner", "s": "Austrian School", "peak": 2007, "pct": 25, "total": 24, "df": 5, "theme": "Wechselseitige Einfl\xFCsse" }, { "n": "Adam Ferguson", "s": "Classical", "peak": 1997, "pct": 25, "total": 20, "df": 4, "theme": "Knut Wicksell" }, { "n": "Mark Blaug", "s": "Contemporary", "peak": 2001, "pct": 24, "total": 182, "df": 17, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "John Maynard Keynes", "s": "Keynesian", "peak": 2019, "pct": 24, "total": 349, "df": 17, "theme": "\xD6konomie und Evolution" }, { "n": "Allan George Barnard Fisher", "s": "Development Economics", "peak": 2016, "pct": 24, "total": 112, "df": 8, "theme": "Stagnations- und Deflationsthe" }, { "n": "J\xFCrgen Backhaus", "s": "Institutional", "peak": 2021, "pct": 24, "total": 62, "df": 7, "theme": "Entwicklung der Konjunkturfors" }, { "n": "Piero Sraffa", "s": "Post-Keynesian/Sraffian", "peak": 2003, "pct": 23, "total": 146, "df": 14, "theme": "\xD6konomie und Religion" }, { "n": "Karl Gustav Cassel", "s": "Neoclassical", "peak": 1992, "pct": 23, "total": 131, "df": 12, "theme": "Deutsche Finanzwissenschaft zw" }, { "n": "John Locke", "s": "Philosophy", "peak": 2018, "pct": 23, "total": 65, "df": 10, "theme": "Kameralismus und Merkantilismu" }, { "n": "Robert Merton Solow", "s": "Neoclassical", "peak": 2016, "pct": 23, "total": 60, "df": 9, "theme": "Stagnations- und Deflationsthe" }, { "n": "Ludwig von Mises", "s": "Austrian School", "peak": 2019, "pct": 23, "total": 83, "df": 9, "theme": "\xD6konomie und Evolution" }, { "n": "Axel Leijonhufvud", "s": "Keynesian", "peak": 2004, "pct": 23, "total": 78, "df": 8, "theme": "Wirtschaftswissenschaft und Te" }, { "n": "Harald Winkel", "s": "Historical School", "peak": 2002, "pct": 23, "total": 44, "df": 8, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Joseph Alois Schumpeter", "s": "Evolutionary", "peak": 2016, "pct": 22, "total": 463, "df": 28, "theme": "Stagnations- und Deflationsthe" }, { "n": "Karl Marx", "s": "Marxist", "peak": 2002, "pct": 22, "total": 193, "df": 13, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Charles Poor Kindleberger", "s": "Development Economics", "peak": 2017, "pct": 22, "total": 36, "df": 6, "theme": "Einkommens- und Verm\xF6gensverte" }, { "n": "Frank Hyneman Knight", "s": "Neoclassical", "peak": 1999, "pct": 21, "total": 39, "df": 7, "theme": "Die \xC4ltere Historische Schule" }, { "n": "Keith Tribe", "s": "Historical School", "peak": 2003, "pct": 20, "total": 40, "df": 9, "theme": "\xD6konomie und Religion" }, { "n": "Terence Wilmot Hutchison", "s": "Philosophy", "peak": 1983, "pct": 20, "total": 40, "df": 7, "theme": "Marx, Keynes, Schumpeter" }, { "n": "Friedrich List", "s": "National Economy", "peak": 2002, "pct": 20, "total": 49, "df": 7, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Friedrich Benedict Wilhelm von Hermann", "s": "Classical", "peak": 1997, "pct": 20, "total": 25, "df": 5, "theme": "Knut Wicksell" }, { "n": "Karl Heinrich Rau", "s": "Classical", "peak": 1999, "pct": 20, "total": 25, "df": 5, "theme": "Die \xC4ltere Historische Schule" }, { "n": "John Richard Hicks", "s": "Neoclassical", "peak": 2010, "pct": 19, "total": 122, "df": 13, "theme": "\xD6konomik zwischen Natur- und G" }, { "n": "Wilhelm Georg Friedrich Roscher", "s": "Historical School", "peak": 1999, "pct": 19, "total": 188, "df": 13, "theme": "Die \xC4ltere Historische Schule" }, { "n": "William Stanley Jevons", "s": "Neoclassical", "peak": 1989, "pct": 19, "total": 80, "df": 10, "theme": "Friedrich List; Carl Menger; L" }, { "n": "Adam Smith", "s": "Classical", "peak": 2e3, "pct": 18, "total": 221, "df": 18, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Werner Sombart", "s": "Historical School", "peak": 2e3, "pct": 18, "total": 101, "df": 14, "theme": "Ideen, Methoden und Entwicklun" }, { "n": "Gustav von Schmoller", "s": "Historical School", "peak": 1985, "pct": 17, "total": 103, "df": 10, "theme": "Entwicklungen der deutschsprac" }, { "n": "Carl Menger", "s": "Austrian School", "peak": 2015, "pct": 16, "total": 147, "df": 14, "theme": "Kontinuit\xE4t und Wandel in der " }, { "n": "J\xFCrg Niehans", "s": "Neoclassical", "peak": 2008, "pct": 16, "total": 62, "df": 10, "theme": "Einfluss deutschsprachigen Den" }, { "n": "Karl Brandt", "s": "Development Economics", "peak": 2005, "pct": 16, "total": 63, "df": 10, "theme": "German\u2013American Economic Thoug" }, { "n": "James McGill Buchanan", "s": "Institutional", "peak": 1998, "pct": 16, "total": 80, "df": 9, "theme": "John Stuart Mill" }, { "n": "Alfred Marshall", "s": "Neoclassical", "peak": 2002, "pct": 15, "total": 151, "df": 18, "theme": "Deutschsprachige Wirtschaftswi" }, { "n": "Paul Anthony Samuelson", "s": "Neoclassical", "peak": 2008, "pct": 11, "total": 200, "df": 18, "theme": "Einfluss deutschsprachigen Den" }], "school_colors": { "Classical": "#2196F3", "Historical School": "#FF9800", "National Economy": "#795548", "Marxist": "#F44336", "Austrian School": "#CE93D8", "Keynesian": "#4CAF50", "Post-Keynesian/Sraffian": "#00BCD4", "Evolutionary": "#E91E63", "Ordoliberalismus": "#80CBC4", "Raumwirtschaftslehre": "#B39DDB", "Neoclassical": "#90CAF9", "Mathematical Economics": "#B0BEC5", "Institutional": "#FF8A65", "Development Economics": "#D4E157", "Contemporary": "#78909C", "Philosophy": "#EEEEEE", "Other": "#757575" }, "schools": ["Classical", "Historical School", "National Economy", "Marxist", "Austrian School", "Keynesian", "Post-Keynesian/Sraffian", "Evolutionary", "Ordoliberalismus", "Raumwirtschaftslehre", "Neoclassical", "Mathematical Economics", "Institutional", "Development Economics", "Contemporary", "Philosophy", "Other"] };
var SC = RAW.school_colors;
var sn = (n) => n.split(" ").slice(-1)[0];
var BG = "#0a0e1a";
var DIM = "#3a3e50";
var ACC = "#90CAF9";
var base = { fontFamily: "'Georgia','Times New Roman',serif", color: "#c8c8d8" };
var TABS_EN = [
  { id: "flow", label: "A \xB7 Intellectual Tides" },
  { id: "net", label: "B \xB7 Intellectual Constellation" },
  { id: "slope", label: "C \xB7 Rising & Fading" },
  { id: "lag", label: "D \xB7 The Long Reach" },
  { id: "ded", label: "E \xB7 Pillars & Guests" }
];
var TABS_DE = [
  { id: "flow", label: "A \xB7 Intellektuelle Str\xF6mungen" },
  { id: "net", label: "B \xB7 Intellektuelle Konstellation" },
  { id: "slope", label: "C \xB7 Aufsteiger & Vergessene" },
  { id: "lag", label: "D \xB7 Der lange Griff" },
  { id: "ded", label: "E \xB7 S\xE4ulen & G\xE4ste" }
];
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
function AGWAnalysis() {
  const lang = useLang();
  const [tab, setTab] = useState("flow");
  const TABS = lang.de ? TABS_DE : TABS_EN;
  return /* @__PURE__ */ jsxs("div", { style: { ...base, background: BG, minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "20px 28px 0", borderBottom: `1px solid ${DIM}` }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 10,
        letterSpacing: "0.2em",
        color: "#6070a0",
        textTransform: "uppercase",
        marginBottom: 4
      }, children: lang.t("AGW \xB7 43 Conferences \xB7 1980\u20132023", "AGW \xB7 43 Jahrestagungen \xB7 1980\u20132023") }),
      /* @__PURE__ */ jsx("h2", { style: { margin: "0 0 14px", fontSize: 18, fontWeight: "normal", color: "#e0e8ff" }, children: lang.t("Historical Analytics", "Historische Analysen") }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 0 }, children: TABS.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(t.id), style: {
        padding: "7px 16px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 11,
        letterSpacing: "0.06em",
        background: tab === t.id ? "rgba(144,202,249,0.12)" : "transparent",
        color: tab === t.id ? ACC : "#6070a0",
        borderBottom: tab === t.id ? `2px solid ${ACC}` : "2px solid transparent"
      }, children: t.label }, t.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      tab === "flow" && /* @__PURE__ */ jsx(FlowView, { lang }),
      tab === "net" && /* @__PURE__ */ jsx(NetView, { lang }),
      tab === "slope" && /* @__PURE__ */ jsx(SlopeView, { lang }),
      tab === "lag" && /* @__PURE__ */ jsx(LagView, { lang }),
      tab === "ded" && /* @__PURE__ */ jsx(DedView, { lang })
    ] })
  ] });
}
function FlowView({ lang }) {
  const schools = RAW.schools.filter((s) => RAW.flow.some((r) => r[s] > 0.5));
  const data = RAW.flow.filter((r) => r.year >= 1982);
  return /* @__PURE__ */ jsxs("div", { style: { padding: "16px 16px 0" }, children: [
    /* @__PURE__ */ jsx("p", { style: { margin: "0 0 8px 4px", fontSize: 12, color: "#6070a0", fontStyle: "italic" }, children: lang.t("Proportional share of citations per school, per conference year. Hover for details.", "Anteil der Zitate pro Schule und Konferenzjahr. Hover f\xFCr Details.") }),
    /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 370, children: /* @__PURE__ */ jsxs(AreaChart, { data, margin: { top: 10, right: 20, left: 0, bottom: 45 }, children: [
      /* @__PURE__ */ jsx(
        XAxis,
        {
          dataKey: "year",
          tick: { fill: "#5a6080", fontSize: 9 },
          interval: 4,
          angle: -45,
          textAnchor: "end"
        }
      ),
      /* @__PURE__ */ jsx(YAxis, { tick: { fill: "#5a6080", fontSize: 9 }, tickFormatter: (v) => `${v}%` }),
      /* @__PURE__ */ jsx(Tooltip, { content: ({ active, payload, label }) => {
        if (!active || !payload) return null;
        const conf = RAW.flow.find((r) => r.year === label) || {};
        const top = [...payload].sort((a, b) => b.value - a.value).slice(0, 5);
        return /* @__PURE__ */ jsxs("div", { style: {
          background: "rgba(10,14,26,0.97)",
          border: `1px solid ${DIM}`,
          padding: "8px 12px",
          fontSize: 10,
          borderRadius: 3,
          maxWidth: 240
        }, children: [
          /* @__PURE__ */ jsx("div", { style: { color: ACC, fontWeight: "bold", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsx("div", { style: {
            color: "rgba(200,210,255,0.45)",
            marginBottom: 5,
            fontStyle: "italic",
            fontSize: 9
          }, children: conf.theme }),
          top.map((p) => /* @__PURE__ */ jsxs("div", { style: { color: SC[p.dataKey] || "#888", lineHeight: 1.7 }, children: [
            p.value.toFixed(1),
            "% \xB7 ",
            p.dataKey
          ] }, p.dataKey))
        ] });
      } }),
      schools.map((s) => /* @__PURE__ */ jsx(
        Area,
        {
          type: "monotone",
          dataKey: s,
          stackId: "1",
          stroke: "none",
          fill: SC[s] || "#666",
          fillOpacity: 0.82
        },
        s
      ))
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "4px 14px",
      padding: "8px 4px 12px",
      borderTop: `1px solid ${DIM}`
    }, children: schools.map((s) => /* @__PURE__ */ jsxs("span", { style: {
      fontSize: 9,
      color: SC[s],
      display: "flex",
      alignItems: "center",
      gap: 4
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { width: 6, height: 6, borderRadius: 1, background: SC[s], flexShrink: 0 } }),
      s
    ] }, s)) })
  ] });
}
function NetView({ lang }) {
  const [hov, setHov] = useState(null);
  const W = 760, H = 500;
  const { nodes, links, maxW } = useMemo(() => {
    const nodes2 = RAW.nodes.map((d) => ({ ...d }));
    const byId = Object.fromEntries(nodes2.map((n) => [n.id, n]));
    const links2 = RAW.edges.filter((e) => byId[e.a] && byId[e.b]).map((e) => ({ source: byId[e.a], target: byId[e.b], w: e.w }));
    d3.forceSimulation(nodes2).force("link", d3.forceLink(links2).id((d) => d.id).distance((d) => Math.max(45, 130 - d.w * 4)).strength(0.55)).force("charge", d3.forceManyBody().strength(-180)).force("center", d3.forceCenter(W / 2, H / 2)).force("collision", d3.forceCollide((d) => 9 + Math.sqrt(d.df) * 2)).tick(300).stop();
    nodes2.forEach((d) => {
      d.x = Math.max(28, Math.min(W - 28, d.x));
      d.y = Math.max(28, Math.min(H - 28, d.y));
    });
    return { nodes: nodes2, links: links2, maxW: d3.max(links2, (l) => l.w) || 1 };
  }, []);
  const hovNode = hov ? nodes.find((n) => n.id === hov) : null;
  const hovEdges = hov ? RAW.edges.filter((e) => e.a === hov || e.b === hov).sort((a, b) => b.w - a.w).slice(0, 7) : [];
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
    /* @__PURE__ */ jsxs("p", { style: { margin: "8px 0 4px 16px", fontSize: 12, color: "#6070a0", fontStyle: "italic" }, children: [
      lang.t("Figures co-cited across conferences. Node size = total conferences cited.", "Gemeinsam zitierte Figuren \xFCber Konferenzen hinweg. Knotengr\xF6\xDFe = Konferenzanzahl."),
      "Hover for details."
    ] }),
    /* @__PURE__ */ jsxs(
      "svg",
      {
        width: W,
        height: H,
        style: {
          display: "block",
          background: "rgba(0,0,0,0.2)",
          borderBottom: `1px solid ${DIM}`
        },
        children: [
          /* @__PURE__ */ jsx("g", { children: links.map((l, i) => /* @__PURE__ */ jsx(
            "line",
            {
              x1: l.source.x,
              y1: l.source.y,
              x2: l.target.x,
              y2: l.target.y,
              stroke: `rgba(144,202,249,${0.08 + l.w / maxW * 0.25})`,
              strokeWidth: Math.max(0.5, l.w / maxW * 3.5)
            },
            i
          )) }),
          /* @__PURE__ */ jsx("g", { children: nodes.map((n) => {
            const r = 5 + Math.sqrt(n.df) * 1.8;
            const col = SC[n.s] || "#888";
            const isH = hov === n.id;
            return /* @__PURE__ */ jsxs(
              "g",
              {
                transform: `translate(${n.x},${n.y})`,
                style: { cursor: "pointer" },
                onMouseEnter: () => setHov(n.id),
                onMouseLeave: () => setHov(null),
                children: [
                  isH && /* @__PURE__ */ jsx(
                    "circle",
                    {
                      r: r + 5,
                      fill: "none",
                      stroke: col,
                      strokeWidth: 1.5,
                      opacity: 0.5
                    }
                  ),
                  /* @__PURE__ */ jsx("circle", { r, fill: col, opacity: isH ? 1 : 0.82 }),
                  /* @__PURE__ */ jsx(
                    "text",
                    {
                      textAnchor: "middle",
                      dy: -(r + 4),
                      fontSize: isH ? 9 : 7.5,
                      fill: col,
                      opacity: isH ? 1 : 0.85,
                      style: { pointerEvents: "none", fontWeight: isH ? "bold" : "normal" },
                      children: sn(n.id)
                    }
                  )
                ]
              },
              n.id
            );
          }) })
        ]
      }
    ),
    hovNode && /* @__PURE__ */ jsxs("div", { style: {
      position: "absolute",
      top: 44,
      right: 16,
      zIndex: 20,
      background: "rgba(10,14,26,0.96)",
      border: `1px solid rgba(144,202,249,0.2)`,
      borderLeft: `3px solid ${SC[hovNode.s] || "#888"}`,
      padding: "10px 14px",
      borderRadius: 3,
      fontSize: 10,
      lineHeight: 1.9,
      maxWidth: 230,
      pointerEvents: "none"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontWeight: "bold",
        color: "#e0e8ff",
        fontSize: 11,
        marginBottom: 2
      }, children: hovNode.id }),
      /* @__PURE__ */ jsx("div", { style: { color: SC[hovNode.s] || "#888" }, children: hovNode.s }),
      /* @__PURE__ */ jsxs("div", { style: { color: "#6070a0", marginBottom: 6 }, children: [
        "b.",
        hovNode.b,
        " \xB7 ",
        hovNode.df,
        " conferences"
      ] }),
      /* @__PURE__ */ jsx("div", { style: { color: "#4a5888", fontSize: 9, marginBottom: 3 }, children: "Most frequently co-cited with:" }),
      hovEdges.map((e) => {
        const other = e.a === hov ? e.b : e.a;
        const oNode = nodes.find((n) => n.id === other);
        return /* @__PURE__ */ jsxs("div", { style: { color: SC[oNode?.s] || ACC }, children: [
          e.w,
          "\xD7 \xB7 ",
          sn(other)
        ] }, other);
      })
    ] })
  ] });
}
function SlopeView({ lang }) {
  const [hov, setHov] = useState(null);
  const data = RAW.slope.slice().sort((a, b) => b.h2 - b.h1 - (a.h2 - a.h1));
  const maxVal = Math.max(...data.map((d) => Math.max(d.h1, d.h2)), 1);
  const W = 580, PAD = 170, H_ROW = 26, TOP = 30;
  const H = TOP + data.length * H_ROW + 40;
  const half = (W - PAD * 2) / 2;
  const xL = (v) => PAD + v / maxVal * half;
  const xR = (v) => W - PAD - v / maxVal * half;
  return /* @__PURE__ */ jsxs("div", { style: { overflowX: "auto", padding: "8px 0" }, children: [
    /* @__PURE__ */ jsx("p", { style: { margin: "8px 0 4px 16px", fontSize: 12, color: "#6070a0", fontStyle: "italic" }, children: lang.t("1980\u20132001 (left) vs 2002\u20132023 (right). Hover for school and change ratio.", "1980\u20132001 (links) vs. 2002\u20132023 (rechts). Hover f\xFCr Schule und Ver\xE4nderungsrate.") }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      justifyContent: "center",
      gap: 60,
      marginBottom: 6,
      fontSize: 10,
      color: "#6070a0"
    }, children: [
      /* @__PURE__ */ jsx("span", { children: "\u25C0 1980\u20132001" }),
      /* @__PURE__ */ jsx("span", { children: "2002\u20132023 \u25B6" })
    ] }),
    /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", style: { display: "block", width: "100%", height: "auto", maxWidth: W + "px", margin: "0 auto" }, children: [
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: W / 2,
          y1: TOP - 8,
          x2: W / 2,
          y2: H - 30,
          stroke: "rgba(200,210,255,0.1)",
          strokeWidth: 1,
          strokeDasharray: "3,3"
        }
      ),
      data.map((d, i) => {
        const y = TOP + i * H_ROW + H_ROW / 2;
        const col = SC[d.s] || "#888";
        const isH = hov === d.n;
        const bH = H_ROW * 0.55;
        const rising = d.h2 > d.h1;
        return /* @__PURE__ */ jsxs(
          "g",
          {
            onMouseEnter: () => setHov(d.n),
            onMouseLeave: () => setHov(null),
            children: [
              /* @__PURE__ */ jsx(
                "rect",
                {
                  x: xL(d.h1),
                  y: y - bH / 2,
                  width: W / 2 - xL(d.h1),
                  height: bH,
                  fill: col,
                  opacity: isH ? 0.85 : 0.4,
                  rx: 1
                }
              ),
              /* @__PURE__ */ jsx(
                "rect",
                {
                  x: W / 2,
                  y: y - bH / 2,
                  width: xR(d.h2) - W / 2,
                  height: bH,
                  fill: col,
                  opacity: isH ? 0.9 : 0.65,
                  rx: 1
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: W / 2,
                  y: y + 3.5,
                  textAnchor: "middle",
                  fontSize: 7,
                  fill: rising ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                  children: rising ? "\u2191" : "\u2193"
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: W / 2 - 8,
                  y: y + 3.5,
                  textAnchor: "end",
                  fontSize: isH ? 9.5 : 8,
                  fill: isH ? col : "rgba(200,210,255,0.65)",
                  children: sn(d.n)
                }
              ),
              isH && /* @__PURE__ */ jsxs("text", { x: W / 2 + 10, y: y + 3.5, textAnchor: "start", fontSize: 8, fill: col, children: [
                "\xD7",
                d.ratio,
                " \xB7 ",
                d.s
              ] })
            ]
          },
          d.n
        );
      }),
      /* @__PURE__ */ jsx("text", { x: W / 2 - 8, y: H - 10, textAnchor: "end", fontSize: 8, fill: "#4a5070", children: "1980\u20132001" }),
      /* @__PURE__ */ jsx("text", { x: W / 2 + 8, y: H - 10, textAnchor: "start", fontSize: 8, fill: "#4a5070", children: "2002\u20132023" })
    ] })
  ] });
}
function LagView({ lang }) {
  const [hov, setHov] = useState(null);
  const data = RAW.lag.filter((d) => d.b >= 1550 && d.lag >= 0);
  const P = { l: 55, r: 20, t: 20, b: 45 };
  const W = 720, H = 440, IW = W - P.l - P.r, IH = H - P.t - P.b;
  const minB = 1550, maxB = 1980, minD = 1978, maxD = 2025;
  const xOf = (b) => P.l + (b - minB) / (maxB - minB) * IW;
  const yOf = (d) => P.t + IH - (d - minD) / (maxD - minD) * IH;
  const hovItem = hov ? data.find((d) => d.n === hov) : null;
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", overflowX: "auto", padding: "8px 0" }, children: [
    /* @__PURE__ */ jsx("p", { style: { margin: "8px 0 4px 16px", fontSize: 12, color: "#6070a0", fontStyle: "italic" }, children: lang.t("X = birth year \xB7 Y = first AGW citation \xB7 Points high-and-left = long discovery lag", "X = Geburtsjahr \xB7 Y = erste AGW-Zitation \xB7 Hoch-und-links = lange Entdeckungsverz\xF6gerung") }),
    /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", style: { display: "block", width: "100%", height: "auto", maxWidth: W + "px" }, children: [
      [
        [1550, 1650, "rgba(255,193,7,0.04)"],
        [1650, 1750, "rgba(33,150,243,0.05)"],
        [1750, 1820, "rgba(76,175,80,0.05)"],
        [1820, 1870, "rgba(76,175,80,0.04)"],
        [1870, 1940, "rgba(156,39,176,0.06)"],
        [1940, 1980, "rgba(233,30,99,0.05)"]
      ].map(([a, b, c]) => /* @__PURE__ */ jsx("rect", { x: xOf(a), y: P.t, width: xOf(b) - xOf(a), height: IH, fill: c }, a)),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: xOf(1723),
          y1: yOf(1723),
          x2: xOf(1968),
          y2: yOf(1968),
          stroke: "rgba(200,210,255,0.07)",
          strokeWidth: 1,
          strokeDasharray: "4,3"
        }
      ),
      [1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950].map((b) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: xOf(b),
            y1: P.t,
            x2: xOf(b),
            y2: P.t + IH,
            stroke: "rgba(200,210,255,0.05)",
            strokeWidth: 0.5
          }
        ),
        /* @__PURE__ */ jsx("text", { x: xOf(b), y: H - 8, textAnchor: "middle", fontSize: 8, fill: "#4a5070", children: b })
      ] }, b)),
      [1980, 1990, 2e3, 2010, 2020].map((y) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: P.l,
            y1: yOf(y),
            x2: P.l + IW,
            y2: yOf(y),
            stroke: "rgba(200,210,255,0.05)",
            strokeWidth: 0.5
          }
        ),
        /* @__PURE__ */ jsx("text", { x: P.l - 4, y: yOf(y) + 3, textAnchor: "end", fontSize: 8, fill: "#4a5070", children: y })
      ] }, y)),
      data.map((d) => {
        const r = Math.max(3, Math.sqrt(d.df) * 1.8);
        const isH = hov === d.n;
        const col = SC[d.s] || "#888";
        return /* @__PURE__ */ jsx(
          "circle",
          {
            cx: xOf(d.b),
            cy: yOf(d.debut),
            r: isH ? r + 4 : r,
            fill: col,
            opacity: isH ? 1 : 0.65,
            stroke: isH ? "rgba(255,255,255,0.8)" : "none",
            strokeWidth: 1.5,
            onMouseEnter: () => setHov(d.n),
            onMouseLeave: () => setHov(null),
            style: { cursor: "pointer" }
          },
          d.n
        );
      }),
      /* @__PURE__ */ jsx("text", { x: P.l + IW / 2, y: H - 1, textAnchor: "middle", fontSize: 9, fill: "#5a6080", children: lang.t("Birth year", "Geburtsjahr") }),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: 12,
          y: P.t + IH / 2,
          textAnchor: "middle",
          fontSize: 9,
          fill: "#5a6080",
          transform: `rotate(-90,12,${P.t + IH / 2})`,
          children: lang.t("First AGW appearance", "Erster AGW-Auftritt")
        }
      )
    ] }),
    hovItem && /* @__PURE__ */ jsxs("div", { style: {
      position: "absolute",
      top: 40,
      right: 20,
      zIndex: 10,
      background: "rgba(10,14,26,0.96)",
      border: `1px solid ${DIM}`,
      borderLeft: `3px solid ${SC[hovItem.s] || "#888"}`,
      padding: "8px 12px",
      borderRadius: 3,
      fontSize: 10,
      lineHeight: 1.7,
      maxWidth: 210,
      pointerEvents: "none"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontWeight: "bold", color: "#e0e8ff" }, children: hovItem.n }),
      /* @__PURE__ */ jsx("div", { style: { color: SC[hovItem.s] || "#888" }, children: hovItem.s }),
      /* @__PURE__ */ jsxs("div", { style: { color: "#6070a0" }, children: [
        "b.",
        hovItem.b,
        " \xB7 debut ",
        hovItem.debut
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { color: ACC }, children: [
        "Discovery lag: ",
        hovItem.lag,
        " yr"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { color: "#6070a0", fontSize: 9 }, children: [
        hovItem.df,
        " conferences total"
      ] })
    ] })
  ] });
}
function DedView({ lang }) {
  const [hov, setHov] = useState(null);
  const data = RAW.ded.slice(0, 52);
  const BH = 13, PAD = 190, W = 740, H = data.length * BH + 60;
  return /* @__PURE__ */ jsxs("div", { style: { overflowX: "auto", padding: "8px 0" }, children: [
    /* @__PURE__ */ jsxs("p", { style: { margin: "8px 0 4px 16px", fontSize: 12, color: "#6070a0", fontStyle: "italic" }, children: [
      lang.t("% of total citations from single peak year. Low % = pillar (cited every year).", "% aller Zitate aus einem Spitzenjahr. Niedrig = S\xE4ule (jedes Jahr zitiert)."),
      "High % = guest (dedicated conference only)."
    ] }),
    /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", style: { display: "block", width: "100%", height: "auto", maxWidth: W + "px" }, children: [
      [0, 25, 50, 75, 100].map((v) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: PAD + v / 100 * (W - PAD - 20),
            y1: 16,
            x2: PAD + v / 100 * (W - PAD - 20),
            y2: H - 18,
            stroke: "rgba(200,210,255,0.07)",
            strokeWidth: 0.5
          }
        ),
        /* @__PURE__ */ jsxs(
          "text",
          {
            x: PAD + v / 100 * (W - PAD - 20),
            y: H - 5,
            textAnchor: "middle",
            fontSize: 8,
            fill: "#4a5070",
            children: [
              v,
              "%"
            ]
          }
        )
      ] }, v)),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: PAD + 0.25 * (W - PAD - 20),
          y1: 16,
          x2: PAD + 0.25 * (W - PAD - 20),
          y2: H - 18,
          stroke: "rgba(144,202,249,0.2)",
          strokeWidth: 1,
          strokeDasharray: "3,3"
        }
      ),
      /* @__PURE__ */ jsx("text", { x: PAD + 0.25 * (W - PAD - 20) + 4, y: 13, fontSize: 8, fill: ACC, children: "pillar" }),
      data.map((d, i) => {
        const y = i * BH + 24;
        const col = SC[d.s] || "#888";
        const isH = hov === d.n;
        const bW = d.pct / 100 * (W - PAD - 20);
        const isPillar = d.pct <= 25;
        return /* @__PURE__ */ jsxs(
          "g",
          {
            onMouseEnter: () => setHov(d.n),
            onMouseLeave: () => setHov(null),
            children: [
              /* @__PURE__ */ jsx(
                "rect",
                {
                  x: PAD,
                  y,
                  width: bW,
                  height: BH - 2,
                  fill: col,
                  opacity: isH ? 0.9 : isPillar ? 0.3 : 0.65,
                  rx: 1
                }
              ),
              isH && /* @__PURE__ */ jsxs("text", { x: PAD + bW + 5, y: y + BH - 3, fontSize: 8, fill: col, children: [
                d.pct,
                "% \xB7 peak ",
                d.peak,
                " \xB7 ",
                d.theme
              ] }),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: PAD - 5,
                  y: y + BH - 3,
                  textAnchor: "end",
                  fontSize: isH ? 9 : 7.5,
                  fill: isH ? col : isPillar ? "rgba(200,210,255,0.85)" : "rgba(200,210,255,0.5)",
                  children: sn(d.n)
                }
              ),
              isPillar && /* @__PURE__ */ jsx("text", { x: 5, y: y + BH - 3, fontSize: 7, fill: ACC, children: "\u25CF" })
            ]
          },
          d.n
        );
      })
    ] })
  ] });
}
export {
  AGWAnalysis as default
};
