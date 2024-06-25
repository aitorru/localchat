import { Message } from "~/routes/localchat";

export default function SelfMessage(context: { msg: Message }) {
    return (
        <div class="bg-gray-100 p-2 rounded">
            {context.msg.content}
        </div>
    )
}