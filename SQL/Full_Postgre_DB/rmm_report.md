                                              markdown                                              
----------------------------------------------------------------------------------------------------
 # Risk Management Record (RMM)                                                                    +
 **Record ID:** b8d5fdeb-fa7c-47d5-950c-6e30abf891d3                                               +
                                                                                                   +
 ## 1. Hazard                                                                                      +
 **Hazard:** Foreign Materials and Particulates                                                    +
 **Category:** Biological and Chemical                                                             +
                                                                                                   +
 ## 2. Harm                                                                                        +
 **Harm Code:** RESP_IRR                                                                           +
 **Name:** Respiratory Irritation                                                                  +
 **Definition:** Respiratory tract irritation and inflammatory response due to inhaled particulates+
                                                                                                   +
 ## 3. Initial Risk Assessment                                                                     +
 **Assessment ID:** 707155c3-4075-4308-9506-a6256a70a021                                           +
 **Severity:** S3                                                                                  +
 **P2 (numeric):** 0.1                                                                             +
 **Risk Zone:** Z2 - ALARP                                                                         +
                                                                                                   +
 ## 4. Controls                                                                                    +
 ### Control: HEPA Filtration Requirement                                                          +
 **Requirement ID:** REQ-HEPA-FILT                                                                 +
 **Text:** Integrated HEPA-grade filtration to reduce particulate exposure.                        +
 **P1 Impact:** Reduces probability from P1-L3 to P1-L2.                                           +
 **P2 Impact:** None                                                                               +
                                                                                                   +
 #### Evidence                                                                                     +
 - **Type:** implementation                                                                        +
 - **Reference:** https://example.com/hepa-certification                                           +
 - **Locator:** Certification Report Section 4.2                                                   +
 - **Rationale:** HEPA filtration system installation verified through third-party certification.  +
                                                                                                   +
 ## 5. Residual Risk Assessment                                                                    +
 **Assessment ID:** 55e7369a-3ba3-41bb-9121-63f2d439b784                                           +
 **Severity:** S3                                                                                  +
 **P2 (numeric):** 0.01                                                                            +
 **Risk Zone:** Z1 - Acceptable                                                                    +
                                                                                                   +
 ## 6. Final Decision                                                                              +
 Residual risk is **Acceptable**, and therefore acceptable.                                        +
                                                                                                   +
 Generated automatically from PostgreSQL using `v_rmm_markdown_export`.                            +
 
(1 row)

