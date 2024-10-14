export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { user_id } = body

    try {
        const response = await fetch(process.env.CV_PARSER_URL!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id }),
        })

        if (!response.ok) {
            throw new Error('Failed to update user profile')
        }

        const result = await response.json()
        return { success: true, data: result }
    } catch (error) {
        console.error('Error updating user profile:', error)
        return createError({
            statusCode: 500,
            statusMessage: 'Failed to update user profile',
        })
    }
})