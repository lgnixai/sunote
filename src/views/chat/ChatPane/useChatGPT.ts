import {notifications} from '@mantine/notifications'
import {IndexableType} from 'dexie'
import {useLiveQuery} from 'dexie-react-hooks'
import {ChatCompletionRequestMessage} from 'openai'
import {db} from '~/db'
import {createChatCompletion} from './openai'
import {executeQuery} from "~/connection";

export interface ISendingParams {
  chatId?: string | IndexableType
  content?: string
  systemContent?: string
}

export function useChatGPT() {
	const apiKey="sk-YDeBc5W71RRhW24E86C82566A3A045F089A62730C09a8c6e"
  // const apiKey = useLiveQuery(async () => {
  //   return (await db.settings.where({id: 'general'}).first())?.openAiApiKey
  // }) as string

  const checkAPIKey = () => {
    if (!Boolean(apiKey)) {
      return notifications.show({
        title: 'Error',
        color: 'red',
        message: 'OpenAI API Key is not defined. Please set your API Key',
      })
    }

    return true
  }

  const makeMessagesSendingRequest = async (sending: ISendingParams) => {
    const {chatId, content, systemContent} = sending
    // Declare two empty arrays to store chat messages
    let messagesCached: ChatCompletionRequestMessage[] = []
    let messagesSending: ChatCompletionRequestMessage[] = []

    // If chatId is not undefined, pull old messages from database where chatId matches and sort them by createdAt
    if (chatId) {

		const response = await executeQuery(`select  * from  messages where chatId="${chatId}" order by createdAt asc `);
		const rs = response[0].result;
      messagesCached = rs;//await db.messages.where({chatId}).sortBy('createdAt')
    }

    // If systemContent exists, push it to messagesSending array with role as 'system'
    if (systemContent && typeof systemContent === 'string') {
      messagesSending.push({role: 'system', content: systemContent.trim()})
    }

    // Using spread operator combine the messages from messagesCached array (old messages from database) into messagesSending
    messagesSending.push(
      ...messagesCached.map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
    )

    // If content exists, add it to messagesCached array as a new user message with role as 'user'
    if (content && typeof content === 'string') {
      messagesSending.push({role: 'user', content: content.trim()})
    }

    return messagesSending
  }

  const sendMessage = async (sending: ISendingParams = {}) => {
    const messagesSending = await makeMessagesSendingRequest(sending)
    return createChatCompletion(apiKey, messagesSending)
  }

  return {apiKey, checkAPIKey, makeMessagesSendingRequest, sendMessage}
}

