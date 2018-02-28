/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function listJobs (projectId, filter, jobType) {
  // [START dlp_list_jobs]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp').v2;

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The filter expression to use
  // For more information and filter syntax, see https://cloud.google.com/dlp/docs/reference/rest/v2beta2/projects.dlpJobs/list
  // const filter = `state=DONE`;

  // The type of job to list (either 'INSPECT' or 'REDACT')
  // const jobType = 'INSPECT';

  // Construct request for listing DLP scan jobs
  const request = {
    parent: dlp.projectPath(projectId),
    filter: filter,
    type: jobType
  };

  // Run job-listing request
  dlp.listDlpJobs(request)
    .then((response) => {
      const jobs = response[0];
      jobs.forEach(job => {
        console.log(`Job ${job.name} status: ${job.state}`);

        const infoTypeStats = job.inspectDetails.result.infoTypeStats;
        if (infoTypeStats.length > 0) {
          infoTypeStats.forEach(infoTypeStat => {
            console.log(`  Found ${infoTypeStat.count} instance(s) of infoType ${infoTypeStat.infoType.name}.`);
          });
        } else {
          console.log(`No findings.`);
        }
      });
    })
    .catch(err => {
      console.log(`Error in listJobs: ${err.message || err}`);
    });
  // [END dlp_list_jobs]
}

function deleteJob (projectId, jobName) {
  // [START dlp_delete_job]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp').v2;

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // Construct job deletion request
  const request = {
    parent: dlp.projectPath(projectId),
    name: jobName
  };

  // Run job deletion request
  dlp.deleteDlpJob(request)
    .then(response => {
      console.log(`Successfully deleted job ${jobName}.`);
    })
    .catch(err => {
      console.log(`Error in deleteJob: ${err.message || err}`);
    });
  // [END dlp_delete_job]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `list <filter>`,
    `List Data Loss Prevention API jobs corresponding to a given filter.`,
    {
      jobType: {
        type: 'string',
        alias: 't',
        default: 'INSPECT'
      }
    },
    opts => listJobs(opts.projectId, opts.filter, opts.jobType)
  )
  .command(
    `delete <jobName>`,
    `Delete results of a Data Loss Prevention API job.`,
    {},
    opts => deleteJob(opts.projectId, opts.jobName)
  )
  .option('p', {
    type: 'string',
    alias: 'projectId',
    default: process.env.GCLOUD_PROJECT
  })
  .example(`node $0 list "state=DONE" -t REDACT`)
  .example(`node $0 delete projects/YOUR_GCLOUD_PROJECT/dlpJobs/X-#####`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/dlp/docs.`
  );

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}