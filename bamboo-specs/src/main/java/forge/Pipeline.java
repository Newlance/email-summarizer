package forge;

import com.atlassian.bamboo.specs.api.BambooSpec;
import com.lmig.forge.bamboo.specs.patterns.AddOns;
import com.lmig.forge.bamboo.specs.patterns.build.node.NodeAppBuild;
import com.lmig.forge.bamboo.specs.patterns.deployment.cloudfoundry.CloudFoundryFileDeployment;

import static forge.PipelineParameters.PIPELINE_CONFIGURATION;
import static com.lmig.forge.bamboo.specs.patterns.DeploymentAddOn.CONFIGURE_IDP;

@BambooSpec
public class Pipeline {

    private static final AddOns ADD_ONS = new AddOns()
      .buildAddOns(
         /* Add an available build add-on here */
      )
      .deploymentAddOns(
         CONFIGURE_IDP
      );

    public static void main(String[] args) {
      
      /**
       * BuildPattern: StaticContentBuild
       *
       * For additional information see https://docs.forge.lmig.com/articles/specs/patterns/build/staticfile/staticcontentbuild
       */
      new NodeAppBuild(PIPELINE_CONFIGURATION)
        .noTests()
        .releaseEntireDirectory()
        
        .addOns(ADD_ONS)
        .publish();

      /**
       * DeploymentPattern: GenericDeployment
       *
       * For additional information see https://docs.forge.lmig.com/articles/specs/patterns/deployment/generic/genericdeployment
       */
      new CloudFoundryFileDeployment(PIPELINE_CONFIGURATION)
        .addOns(ADD_ONS)
        .autoDeployAfterSuccessfulBuild()
        .publish();
    }
}
