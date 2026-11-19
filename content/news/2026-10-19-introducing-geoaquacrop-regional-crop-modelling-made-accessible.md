---
title: "Introducing GeoAquaCrop: Regional Crop Modelling Made Accessible"
date: 2026-10-19
author: Seyed Hosseini
image: ./images/2026-10-19-logo.png
imageAlt: "GeoAquaCrop logo"
---

We are glad to announce the release of GeoAquaCrop, an open-source Python package developed in collaboration with researchers from Aalto University and the University of Manchester. GeoAquaCrop runs FAO’s AquaCrop crop model across entire regions, river basins, or countries on a spatial grid, removing the data preparation and infrastructure burden that has traditionally made regional crop modelling slow and complex.

The package takes a geospatial boundary as input and handles the full pipeline: it downloads and prepares climate, soil, crop calendar, and crop area data; runs the AquaCrop-OSPy model in parallel across every grid cell; and presents the results in an interactive dashboard. Outputs include crop yields, crop water use, and irrigation water requirements, and can be exported as NetCDF, GeoTIFF, or CSV files.

> ‘Give it a geospatial boundary file and it handles the whole pipeline. Point it at a historical period or a future climate scenario and the workflow is identical — only the forcing changes.’

GeoAquaCrop supports 15 crops under both rainfed and irrigated conditions, historical climate data from 1979, and future projections from SSP1-2.6 to SSP5-8.5. It is modular by design, so preprocessing, simulation, and visualisation can be installed and used independently or as a single toolchain. The package is released under the Apache-2.0 licence and is fully documented.

The tool was built in collaboration with Josias Láng-Ritter, Chris Bowden, Seyed Hossein Hosseini, Henrikki Tenkanen, and Tim Foster. A preprint with a Mekong River Basin case study is forthcoming. The code is available on GitHub, and the team welcomes contributions, issue reports, and feedback from the crop modelling and water resources community.

[https://github.com/aquacropos/geoaquacrop](https://github.com/aquacropos/geoaquacrop)
