/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */
import axios from "axios";

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("summarize").onclick = summarize;
    //document.getElementById("bulletize").onclick = bulletize;
    document.getElementById("acronyms").onclick = acronyms;
  }
});

export async function summarize() {
  document.getElementById("summaryOutput").textContent = "Loading, please wait...";
  getCurrentEmailAsSummary();
}
export async function bulletize() {
  document.getElementById("bulletOutput").textContent = "Loading, please wait...";
  getCurrentEmailAsBullets();
}
export async function acronyms() {
  document.getElementById("acronymsOutput").textContent = "Loading, please wait...";
  getCurrentEmailAcronyms();
}
async function getCurrentEmailAsSummary() {
  const item = Office.context.mailbox.item;
  try {
    return await item.body.getAsync(Office.CoercionType.Text, getSummary);
  } catch (e) {
    document.getElementById("summaryOutput").textContent = e.message;
  }
}

async function getCurrentEmailAsBullets() {
  const item = Office.context.mailbox.item;
  try {
    return await item.body.getAsync(Office.CoercionType.Text, getBullets);
  } catch (e) {
    document.getElementById("bulletOutput").textContent = e.message;
  }
}

async function getCurrentEmailAcronyms() {
  const item = Office.context.mailbox.item;
  try {
    return await item.body.getAsync(Office.CoercionType.Text, getAcronyms);
  } catch (e) {
    document.getElementById("acronymsOutput").textContent = e.message;
  }
  //}
}

async function getSummary(rawEmail) {
  document.getElementById("summaryOutput").innerHTML = await queryLibGPTSummary(rawEmail, "summary");
}

async function getBullets(rawEmail) {
  document.getElementById("bulletOutput").innerHTML = await queryLibGPTSummary(rawEmail, "bulletpoints");
}

async function getAcronyms(rawEmail) {
  const arrayOfStrings = await findAllAcronyms(rawEmail);
  document.getElementById("acronymsOutput").innerHTML = "";

  for (let i = 0; i < arrayOfStrings.length; i++) {
    document.getElementById("acronymsOutput").innerHTML +=
      "<b>" + arrayOfStrings[i] + ":</b> " + (await getAcronymDefinition(arrayOfStrings[i].trim())) + "<br>";
  }
}

async function getAcronymDefinition(acronym) {
  try {
    var { data } = await axios.get(
      "https://soup-acronym-service-development.us-east-1.np.paas.lmig.com/acronym/" + acronym.toUpperCase()
    );
    document.getElementById("acronymsOutput").innerHTML = "";

    if (data.length == 0) {
      return "Definition not found";
    } else if (data.length == 1) {
      return cleanseInput(data[0].meaning);
    } else {
      var response = "Possible definitions include: ";
      for (let i = 0; i < data.length; i++) {
        response += data[i].meaning;
        if (i < data.length - 1) response += " or ";
      }
      return cleanseInput(response);
    }
  } catch (e) {
    return e.message;
  }
}

async function queryLibGPTSummary(rawEmail, format) {
  var email = "" + cleanseInput(rawEmail.value) + "";

  const { data } = await axios.post(
    "https://soup-email-api-development.us-east-1.np.paas.lmig.com/summarize",
    {
      prompt: email,
      format: format,
      conciseness: document.getElementById("conciseness-group").querySelector('input[name="conciseness-level"]:checked')
        .value,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return JSON.stringify(data.choices[0].message.content)
    .replaceAll('"', "")
    .replaceAll('\\"', '"')
    .replaceAll("\\n", "<br>");
}

async function findAllAcronyms(rawEmail) {
  var email = "" + cleanseInput(rawEmail.value) + "";

  const { data } = await axios.post(
    "https://soup-email-api-development.us-east-1.np.paas.lmig.com/acronyms",
    {
      prompt: email,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return data.choices[0].message.content.split(",");
}

function cleanseInput(input) {
  const str = input.replace(/[^a-z0-9áéíóúñü \\.,_-]/gim, "");
  return str.trim();
}
