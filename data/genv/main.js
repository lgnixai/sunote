import { Ollama } from "@langchain/community/llms/ollama";

const ollama = new Ollama({
	baseUrl: "http://localhost:11434", // Default value
	model: "llama2", // Default value
});

const stream = await ollama.stream(
	`Translate "I love programming" into German.`
);

const chunks = [];
for await (const chunk of stream) {
 console.log(`${chunk}|`);

	chunks.push(chunk);
}

// stream.next().then(e=>{
// 	console.log("next",e)
// })
//

//console.log(chunks.join(""));
