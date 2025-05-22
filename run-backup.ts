/*// Run actions using the pre initialized 'komodo' client.
const version: Types.GetVersionResponse = await komodo.read('GetVersion', {});
console.log('🦎 Komodo version:', version.version, '🦎\n');
const BRANCH = "1.17.0";
const VERSION = "1.17.0";
const TAG = "dev-7";

*/
const deployment_name = "backup-once";
const tags_match = [];
const servers = await komodo.read("ListServers", {
  query: { tags: tags_match },
});

var deployment = await komodo.read("GetDeployment", {
  deployment: deployment_name,
});

// check if the deployment is running
async function is_running(deployment_name: string) {
  const res = await komodo.read("GetDeploymentContainer", {
    deployment: deployment_name,
  });
  return res.state === Types.DeploymentState.Running;
}

// set the deployment server for deployment to server
async function set_deployment_server(deployment, server) {
  const res = await komodo.write("UpdateDeployment", {
    id: deployment.name,
    config: {
      server_id: server.id,
    },
  });
  return res;
}

for (const server of servers) {
  console.log(`Deploying ${deployment_name} to: ${server}`);
  await set_deployment_server(deployment, server);
  await komodo.execute_and_poll("Deploy", { deployment: deployment.name });
  var deploymentLogResponse = await komodo.read("GetDeploymentLog", {
    deployment: deployment.name,
    tail: 100,
    timestamps: true,
  });
  console.log(deploymentLogResponse.stdout, deploymentLogResponse.stderr);
}
/*
await komodo.write("CommitSync", { sync: "dev" });
console.log("Committed changes to 'dev' Sync");

await komodo.execute("RunProcedure", { procedure: "build-dev" });
console.log("Launched 'build-dev' Procedure");
*/
