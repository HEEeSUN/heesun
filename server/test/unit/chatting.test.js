import ChattingController from "../../controller/chatting";
import httpMocks from "node-mocks-http";

describe("chatting", () => {
  let chattingRepository;
  let chattingController;

  beforeEach(() => {
    chattingRepository = {};
    chattingController = new ChattingController(chattingRepository);
  });

  describe("getChattings", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        username: "testuser",
        query: {
          id: "socketid"
        }
      })
      const response = httpMocks.createResponse();
      const chattingList = [{
        room_name: "chat1",
        noReadMsg: 0,
      },
      {
        room_name: "chat2",
        noReadMsg: 0,
      }]
      chattingController.testInitSocket = jest.fn();
      chattingRepository.getChattings = jest.fn(()=>chattingList);
      chattingRepository.getNoReadMessage = jest.fn(()=>{return {number:1}})
        
      await chattingController.getChattings(request, response);
      
      expect(response.statusCode).toBe(200);
    })
  
    it("성공 : 기존 채팅이 없을 경우", async () => {
      const request = httpMocks.createRequest({
        username: "testuser",
        query: {
          id: "socketid"
        }
      })
      const response = httpMocks.createResponse();
      const chattingList = []
      chattingController.testInitSocket = jest.fn();
      chattingRepository.getChattings = jest.fn(()=>chattingList);
        
      await chattingController.getChattings(request, response);
      
      expect(response.statusCode).toBe(200);
    })

    it("성공 : 회원이 아니고 socketId도 없는 경우", async () => {
      const request = httpMocks.createRequest()
      const response = httpMocks.createResponse();
      const chattingList = []
      chattingController.testInitSocket = jest.fn();
      chattingRepository.getChattings = jest.fn(()=>chattingList);
        
      await chattingController.getChattings(request, response);
      
      expect(response.statusCode).toBe(200);
    })
    
    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        username: "testuser",
        query: {
          id: "socketid"
        }
      })
      const response = httpMocks.createResponse();
      const chattingList = []
      chattingRepository.getChattings = jest.fn(()=>{throw new Error()});
        
      await chattingController.getChattings(request, response);
      
      expect(response.statusCode).toBe(400);
    })
  })
  
  describe("joinRoom", ()=>{
    it("성공", async()=>{
       const request = httpMocks.createRequest({
        body: {
          username: "testuser",
          socketId: "socketid"
        }
      })
      const response = httpMocks.createResponse();
      chattingController.createChatting = () => { return "chat1"}
      
      await chattingController.joinRoom(request, response);
      
      expect(response.statusCode).toBe(200);
    })
    
    it("실패 : catch error", async()=>{
      const request = httpMocks.createRequest({
        body: {
          username: "testuser",
          socketId: "socketid"
        }
      })
      const response = httpMocks.createResponse();
      chattingController.createChatting = jest.fn(()=>{throw new Error()})
      
      await chattingController.joinRoom(request, response);
      
      expect(response.statusCode).toBe(400);
    })
  })
  
  describe("createChatting", ()=>{
    it("성공", async()=>{
      const username = "testUser";
      const member = true;
      const chatListId = 1;
      const result = {};
      chattingRepository.insertInChattingList = () => chatListId;
      chattingRepository.createchattingRoom = () => result;
      chattingRepository.cancelChattingList = jest.fn();
      chattingRepository.recordRoomnameAndPlayer = jest.fn();
      
      await chattingController.createChatting(username, member);
      
       expect(chattingRepository.cancelChattingList).toHaveBeenCalledTimes(0);
    })

    it("실패 : room_name 업데이트 실패", async()=>{
      const username = "testUser";
      const member = true;
      const chatListId = 1;
      const result = undefined;
      chattingRepository.insertInChattingList = () => chatListId;
      chattingRepository.createchattingRoom = () => result;
      chattingRepository.cancelChattingList = jest.fn();
      chattingRepository.recordRoomnameAndPlayer = jest.fn();
      
      await chattingController.createChatting(username, member);
      
       expect(chattingRepository.cancelChattingList).toHaveBeenCalledTimes(1);
    })
    
    it("실패 : catch error", async()=>{
      const username = "testUser";
      const member = true;
      const chatListId = 1;
      const result = {};
      chattingRepository.insertInChattingList = () => chatListId;
      chattingRepository.createchattingRoom = () => {throw new Error()};
      chattingRepository.cancelChattingList = jest.fn();
      
      await chattingController.createChatting(username, member);
      
      expect(chattingRepository.cancelChattingList).toHaveBeenCalledTimes(1);
    })
  })
  
  describe("setDisabledChatting  ", ()=>{
    it("성공", async()=>{
      const request = httpMocks.createRequest({
        params: {
          id: "chat1"
        }
      })
       const response = httpMocks.createResponse();
      chattingRepository.setDisabledChatting  = jest.fn();
      
      await chattingController.setDisabledChatting (request, response);
      
      expect(response.statusCode).toBe(204);
    })
    
      it("실패 : catch error", async()=>{
          const request = httpMocks.createRequest({
        params: {
          id: "chat1"
        }
      })
       const response = httpMocks.createResponse();
      chattingRepository.setDisabledChatting  = jest.fn(()=>{throw new Error()});
      
      await chattingController.setDisabledChatting(request, response);
      
      expect(response.statusCode).toBe(400);
    })
  })
  
  
  describe("deleteChatting",()=>{
    it("성공", async()=>{
          const request = httpMocks.createRequest({
        params: {
          id: "chat1"
        },
      })
       const response = httpMocks.createResponse();
      chattingRepository.deleteChatting = jest.fn();
      
      await chattingController.deleteChatting(request, response)
      
      expect(response.statusCode).toBe(204)
      
    })
    
    it("실패", async()=>{
              const request = httpMocks.createRequest({
        params: {
          id: "chat1"
        },
      })
       const response = httpMocks.createResponse();
      chattingRepository.deleteChatting = jest.fn(()=>{throw new Error()});
      
      await chattingController.deleteChatting(request, response)
      
      expect(response.statusCode).toBe(400)
      
    })
  })
  
  describe("sendMessage", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        body: {
          uniqueId: "1234567", 
          message: "hi", 
          readAMsg: true, 
          socketId: "socketId", 
          chattingUser: "client"
        }
      })
       const response = httpMocks.createResponse();
      const chattingId = 1;
      const chatting = {
        chattingId: 1,
        text: "hi",
        created : "2022-08-01 11:20:01"
      }
      const playerList = [{
        socketId: "socketId"
      },
                         {
        socketId: "socketId2"
      }]
      chattingRepository.saveChatting = () => chattingId;
      chattingRepository.getNewChattingById = () => chatting;
      chattingRepository.getPlayersSocketId = () => playerList;
      
      await chattingController.sendMessage(request, response);
      
      expect(response.statusCode).toBe(200);
    })
        it("실패 : room_name이 전송되지 않음", async () => {
          const request = httpMocks.createRequest({
        username: "testUser",
        body: {
          uniqueId: "1234567", 
          message: "hi", 
          readAMsg: true, 
          socketId: "socketId", 
          chattingUser: "client"
        }
      })
       const response = httpMocks.createResponse();
      const chattingId = 1;
      const chatting = {
        chattingId: 1,
        text: "hi",
        created : "2022-08-01 11:20:01"
      }
      const playerList = [{
        socketId: "socketId"
      },
                         {
        socketId: "socketId2"
      }]
      chattingRepository.saveChatting = () => chattingId;
      chattingRepository.getNewChattingById = () => chatting;
      chattingRepository.getPlayersSocketId = () => playerList;
      
      await chattingController.sendMessage(request, response);
      
      expect(response.statusCode).toBe(400);
    })
    
            it("실패 : 메시지가 저장되지 않음", async () => {
          const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        body: {
          uniqueId: "1234567", 
          message: "hi", 
          readAMsg: true, 
          socketId: "socketId", 
          chattingUser: "client"
        }
      })
       const response = httpMocks.createResponse();
      const chattingId = undefined;
      const chatting = {
        chattingId: 1,
        text: "hi",
        created : "2022-08-01 11:20:01"
      }
      const playerList = [{
        socketId: "socketId"
      },
                         {
        socketId: "socketId2"
      }]
      chattingRepository.saveChatting = () => chattingId;
      chattingRepository.getNewChattingById = () => chatting;
      chattingRepository.getPlayersSocketId = () => playerList;
      
      await chattingController.sendMessage(request, response);
      
      expect(response.statusCode).toBe(400);
    })
    
      it("실패 : catch error", async () => {
          const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        body: {
          uniqueId: "1234567", 
          message: "hi", 
          readAMsg: true, 
          socketId: "socketId", 
          chattingUser: "client"
        }
      })
       const response = httpMocks.createResponse();
      const chattingId = 1;
      const chatting = {
        chattingId: 1,
        text: "hi",
        created : "2022-08-01 11:20:01"
      }
      const playerList = [{
        socketId: "socketId"
      },
                         {
        socketId: "socketId2"
      }]
      chattingRepository.saveChatting = () => {throw new Error()};
      chattingRepository.getNewChattingById = () => chatting;
      chattingRepository.getPlayersSocketId = () => playerList;
      
      await chattingController.sendMessage(request, response);
      
      expect(response.statusCode).toBe(400);
    })
  })
  
  describe("testInitSocket", () => {
    it("성공 : username이 있을 경우(회원인 경우) && 이미 저장된 소켓id가 있는 경우", async () => {
      const username = "testUser";
      const socketId = "socketId";
      const user= {
        
      }
      chattingRepository.getPlayer = jest.fn(()=>user)
      chattingRepository.updateSocketId = jest.fn()
      chattingRepository.recordNewPlayer = jest.fn()
      
      await chattingController.testInitSocket(username, socketId)
      
      expect(chattingRepository.updateSocketId).toHaveBeenCalledTimes(1)
      expect(chattingRepository.recordNewPlayer).toHaveBeenCalledTimes(0)
    })
    
      it("성공 : username이 있을 경우(회원인 경우) && 저장된 소켓id가 없는 경우", async () => {
      const username = "testUser";
      const socketId = "socketId";
      const user= undefined;
      chattingRepository.getPlayer = jest.fn(()=>user)
      chattingRepository.updateSocketId = jest.fn()
      chattingRepository.recordNewPlayer = jest.fn()
      
      await chattingController.testInitSocket(username, socketId)
      
      expect(chattingRepository.updateSocketId).toHaveBeenCalledTimes(0)
      expect(chattingRepository.recordNewPlayer).toHaveBeenCalledTimes(1)
    })
    
    it("성공 : username이 없는 경우 & 이미 저장된 소켓id가 있는 경우", async () => {
      const username = undefined;
      const socketId = "socketId";
      const user= {
        
      }
      chattingRepository.getPlayer = jest.fn(()=>user)
      chattingRepository.updateSocketId = jest.fn()
      chattingRepository.recordNewPlayer = jest.fn()
      
      await chattingController.testInitSocket(username, socketId)
      
      expect(chattingRepository.updateSocketId).toHaveBeenCalledTimes(0)
      expect(chattingRepository.recordNewPlayer).toHaveBeenCalledTimes(0)
    })
    
      it("성공 : username이 없는 경우 & 저장된 소켓id가 없는 경우", async () => {
      const username = undefined;
      const socketId = "socketId";
      const user= undefined
      chattingRepository.getPlayer = jest.fn(()=>user)
      chattingRepository.updateSocketId = jest.fn()
      chattingRepository.recordNewPlayer = jest.fn()
      
      await chattingController.testInitSocket(username, socketId)
      
      expect(chattingRepository.updateSocketId).toHaveBeenCalledTimes(0)
      expect(chattingRepository.recordNewPlayer).toHaveBeenCalledTimes(1)
    })
    
    it("실패", async () => {
      
    })
  })
  
  describe("getMessage", () => {
    it("성공 : 페이지번호가 없는 경우(상대방이 전송한 메시지 1건을 받기 위한 경우)", async () => {
      const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        query: {
          user: "client", 
        }
      })
      const response = httpMocks.createResponse();
      const chatting = {chatting_id:1}
      chattingRepository.getNewChatting = jest.fn(()=>chatting)
      chattingRepository.getChatting = jest.fn();
      chattingRepository.updateNewChatting = jest.fn();
      
      await chattingController.getMessage(request, response);
      
      expect(response.statusCode).toBe(200)
      expect(chattingRepository.getNewChatting).toHaveBeenCalledTimes(1)
      expect(chattingRepository.getChatting).toHaveBeenCalledTimes(0)
    })
    
    it("성공 : 기존에 저장된 메시지들을 받기 위한 경우", async () => {
                  const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        query: {
          page: 1,
          user: "client", 
        }
      })
       const response = httpMocks.createResponse();
      const chatting = [{chatting_id:1}]
      chattingRepository.getNewChatting = jest.fn(()=>chatting)
      chattingRepository.getChatting = jest.fn(()=>chatting)
      chattingRepository.readAllMsg = jest.fn()
      
      await chattingController.getMessage(request, response);
      
      expect(response.statusCode).toBe(200);
      expect(chattingRepository.getNewChatting).toHaveBeenCalledTimes(0)
      expect(chattingRepository.getChatting).toHaveBeenCalledTimes(1)
    })
    
      it("실패 : 페이지 번호가 잘못 온 경우", async () => {
                      const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        query: {
          page: "not a number",
          user: "client", 
        }
      })
       const response = httpMocks.createResponse();
      const chatting = [{chatting_id:1}]
      chattingRepository.getNewChatting = jest.fn(()=>chatting)
      chattingRepository.getChatting = jest.fn(()=>chatting)
      chattingRepository.readAllMsg = jest.fn()
      
      await chattingController.getMessage(request, response);
      
      expect(response.statusCode).toBe(404);
    })
    
        it("실패 : catch error", async () => {
                      const request = httpMocks.createRequest({
        username: "testUser",
        params: {
          id: "chat1"
        },
        query: {
          page: 1,
          user: "client", 
        }
      })
       const response = httpMocks.createResponse();
      const chatting = [{chatting_id:1}]
      chattingRepository.getNewChatting = jest.fn(()=>chatting)
      chattingRepository.getChatting = jest.fn(()=>{throw new Error()})
      chattingRepository.readAllMsg = jest.fn()
      
      await chattingController.getMessage(request, response);
      
      expect(response.statusCode).toBe(400);
      expect(chattingRepository.getNewChatting).toHaveBeenCalledTimes(0)
      expect(chattingRepository.getChatting).toHaveBeenCalledTimes(1)
    })
  })
})