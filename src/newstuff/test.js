const { OpenAIApi, Configuration } = require('openai')

const OPEN_API_CLIENT = new OpenAIApi(
  new Configuration({
    basePath: `https://lm-cf-openai-api-tst01.apim.lmig.com/ignitegpt/openai/deployments/gpt-35-turbo`,
  })
)

const TOKEN_REQUEST = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: '', //inject
    client_secret: '', //inject
    scope: 'https://cognitiveservices.azure.com/.default',
  }),
  redirect: 'follow',
}

const CHAT_REQUEST = {
  temperature: 0.7,
  max_tokens: 250,
  user: '', //inject
}

CHAT_OPTIONS = {
  timeout: 5000,
  headers: {
    Accept: 'application/json',
  },
  params: {
    'api-version': '2023-08-01-preview',
  },
}

async function doThing(messages) {
  try {
    let token
    // globally cache token, if we get to it.
    if (!token || Date.now() >= token.expiration) {
      token = await getToken()
    }

    const response = await OPEN_API_CLIENT.createChatCompletion(
      {
        ...CHAT_REQUEST,
        messages,
      },
      {
        ...CHAT_OPTIONS,
        headers: {
          ...CHAT_OPTIONS.headers,
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    )

    console.log(response.data.choices[0])
  } catch (e) {
    console.log(e)
  }
}

async function getToken() {
  const tokenResponse = await fetch(
    'https://login.microsoftonline.com/08a83339-90e7-49bf-9075-957ccd561bf1/oauth2/v2.0/token',
    TOKEN_REQUEST
  )

  if (tokenResponse.status != 200) {
    throw new Error('Auth token request failed')
  }

  const { access_token, expires_in } = await tokenResponse.json()
  return {
    access_token,
    expiration: new Date(Date.now() + (expires_in - 5) * 1000),
  }
}

doThing([
  {
    content: 'My name is Tim',
    role: 'user',
  },
  {
    content: 'I kinda want to test your content filter real quick',
    role: 'user',
  }
])
