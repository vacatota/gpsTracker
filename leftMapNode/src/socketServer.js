

module.exports = (io) => {
  io.on('connection', (socketServer)=>{
    console.log("New user conected", socketServer.id);
socketServer.on('marker', dataCordenadas =>{
  console.log(dataCordenadas)
  //socket.emit('marker', dataCordenadas);
  socketServer.broadcast.emit('marker', dataCordenadas);
});
  })
}
