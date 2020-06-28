import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../chat/entity/chat.entity';
import { User } from '../user/entity/user.entity';
import { Group } from './entity/group.entity';
import { GroupDto } from './dto/group.dto';

@WebSocketGateway({ namespace: 'group' })// 创建命名空间
export class GroupGateway {
  constructor(
    @InjectRepository(Chat)
    private readonly messageRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  @WebSocketServer()
  server: Server

  // socket连接钩子
  async handleConnection(client,data) {
    // 连接默认加入public房间
    client.join('public')
    return '连接成功'
  }

  @SubscribeMessage('addGroupUser')
  async addGroupUser(client, data: GroupDto) {
    // 让用户加入群
    await client.join(data.group, () => {
      console.log(`用户${data.name}加入群${data.group}`)
    })
    // 广播进群事件
    this.server.to(data.group).emit('addGroupUser', data)
    // 存群组数据库
    await this.groupRepository.save(data);
  }

  getGroup() {
    return this.groupRepository.find()
  }

}

