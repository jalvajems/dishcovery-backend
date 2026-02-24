import { Container } from "inversify";
import { IConversationRepository } from "../../repostories/interface/conversation.repository.interface";
import { ConversationRepository } from "../../repostories/implementation/conversation.repository";
import { IMessageRepository } from "../../repostories/interface/message.repository.interface";
import { MessageRepository } from "../../repostories/implementation/message.repository";
import { IChatService } from "../../services/interface/chat.service.interface";
import { ChatService } from "../../services/implementation/chat.service";
import { ChatController } from "../../controllers/implementation/chat.controller";

const chatModule = (container: Container) => {
    container.bind<IConversationRepository>('IConversationRepository').to(ConversationRepository);
    container.bind<IMessageRepository>('IMessageRepository').to(MessageRepository);
    container.bind<IChatService>('IChatService').to(ChatService);
    container.bind<ChatController>(ChatController).toSelf();
}

export default chatModule;
