# IDP Configuration for Azure Application Registration

<!-- forge.description -->
This pipeline registers an application in Ping or Azure AD.
<!-- /forge.description -->

## Overview

This serves as a starting point for developers looking to deploy IdP configuration for Ping or Azure in a standalone pipeline, not packaged with any application deployment to a runtime environment.  This example uses pipeline-as-code / bamboo specs, making use of the StatiContentBuild and GenericDeployment patterns.

## Pipeline as Code

The pipeline for this project is configured using Pipeline as Code (Bamboo Specs) with the configuration defined in the [bamboo-specs](../browse/bamboo-specs/src/main/java/forge) directory.

## IdP Configuration

IdP configuration exists in `idp-development.yml`.  See the [IdP Pipeline Automation](https://forge.lmig.com/wiki/display/CLOUDFORGE/Identity+%28IDP%29+Pipeline+Automation) wiki pages for documentation on everything you can do within this configuration.
