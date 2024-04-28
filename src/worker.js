self.onmessage = (event) => {
    // const fileUint8Array  = event.data;
    const searchValues = new Uint8Array([0x66, 0x74, 0x79, 0x70]); // ftyp
    const fileUint8Array = new Uint8Array(event.data);
    // let position = [];
  
    for (let i = 0; i < fileUint8Array.length - searchValues.length; i++) {
    
        // self.postMessage({ type: 'index', index: i });

      if (searchValues.every((value, index) => fileUint8Array[i + index] === value)) {
        
        self.postMessage({ type: 'found', fileindex: i-4 });
      }
    }

    self.postMessage({ type: 'complete' });
  };