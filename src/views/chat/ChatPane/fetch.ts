export interface IFetchStreamOptions {
	preset?: "text"
	timeout?: number
	decoder?: <T>(value?: Uint8Array) => T
	onProcess?: (value?: any) => void
	onAbort?: () => void
	onError?: (error: Error) => void
	onTimeout?: () => void
	onDone?: () => void
}

export class FetchStream {
	#options: IFetchStreamOptions
	#abortController: AbortController

	constructor(options: IFetchStreamOptions) {
		this.#options = options
	}

	async createFetchRequest(url: string, options?: RequestInit) {
		this.#abortController = new AbortController()
		this.#timeout()

		return await fetch(url, {
			signal: this.#abortController.signal,
			...options,
		})
			.then((res) => {
				if (res.ok) {
					return res.body!
				}

				throw new Error(`Failed to fetch ${url}`)
			})
			.then(async (body) => {
				const reader = body.getReader()
				if (this.#options.preset === "text") {
					while (true) {
						const { value, done } = await reader.read()
						if (done) {
							this.#options.onDone && this.#options.onDone()
							break
						}
						const val = new TextDecoder().decode(value)
						if (this.#options.onProcess) {
							this.#options.onProcess(val)
						} else {
							console.log(val)
						}
					}
				} else if (this.#options.decoder) {
					while (true) {
						const { value, done } = await reader.read()
						if (done) {
							this.#options.onDone && this.#options.onDone()
							break
						}
						const val = this.#options.decoder(value)
						if (this.#options.onProcess) {
							this.#options.onProcess(val)
						} else {
							console.log(val)
						}
					}
				} else {
					throw new Error("No decoder or preset provided")
				}
			})
			.catch((err) => {
				if (this.#options.onError) {
					this.#options.onError(err)
				} else {
					console.error(err)
				}
			})
	}

	abort() {
		if (this.#abortController) {
			this.#abortController.abort()
			if (this.#options.onAbort) {
				this.#options.onAbort()
			}
		}
	}

	#timeout(timer: number = 6000) {
		const time = this.#options.timeout ?? timer
		if (time === -1) return

		setTimeout(() => {
			this.abort()
			this.#options.onTimeout && this.#options.onTimeout()
		}, time)
	}
}
