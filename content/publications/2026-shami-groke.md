---
title: "GROKE: Vision-Free Navigation Instruction Evaluation via Graph Reasoning on OpenStreetMap"
authors: "Shami, F., S. Dey, N. Van de Weghe & H. Tenkanen"
year: 2026
venue: "Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL 2026) 40371–40391"
url: https://arxiv.org/abs/2601.07375
people:
  - farzad-shami
  - henrikki-tenkanen
  - subhrasankha-dey
projects:
  - geo-r2llm
---

The evaluation of navigation instructions remains a persistent challenge in Vision-and-Language Navigation (VLN) research. Traditional reference-based metrics such as BLEU and ROUGE fail to capture the functional utility of spatial directives, specifically whether an instruction successfully guides a navigator to the intended destination. Although existing VLN agents could serve as evaluators, their reliance on high-fidelity visual simulators introduces licensing constraints and computational costs, and perception errors further confound linguistic quality assessment. This paper introduces GROKE (Graph-based Reasoning over OSM Knowledge for instruction Evaluation), a vision-free training-free hierarchical LLM-based framework for evaluating navigation instructions using OpenStreetMap data. Through systematic ablation studies, we demonstrate that structured JSON and textual formats for spatial information substantially outperform grid-based and visual graph representations. Our hierarchical architecture combines sub-instruction planning with topological graph navigation, reducing navigation error by 68.5% compared to heuristic and sampling baselines on the Map2Seq dataset. The agent's execution success, trajectory fidelity, and decision patterns serve as proxy metrics for functional navigability given OSM-visible landmarks and topology, establishing a scalable and interpretable evaluation paradigm without visual dependencies. Code and data are available at https://anonymous.4open.science/r/groke.
