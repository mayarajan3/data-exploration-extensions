export const getImageHelper = (width, height) => {
  const canvas = document.body.appendChild(document.createElement("canvas"));
  canvas.hidden = true;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  return {

    clearRectangle() {
        // Reset the canvas
        canvas.width = canvas.width;
        return context.getImageData(0, 0, canvas.width, canvas.height);
    },

    createGraph(startXFull: number, startYFull: number, xCoordinates: number[], yCoordinates: number[], fullWidth: number, fullHeight: number, tickNumber: number) {
        // Create padding
        const width = fullWidth - 85;
        const height = fullHeight - 70;

        const startX = startXFull + 50;
        const startY = startYFull + 35;

        // Create the scales
        const xMin = Math.min(...xCoordinates);
        const xMax = Math.max(...xCoordinates);
        const yMin = Math.min(...yCoordinates);
        const yMax = Math.max(...yCoordinates)
        const xScale = width / (Math.max(...xCoordinates) - xMin);
        const yScale = height / (Math.max(...yCoordinates) - yMin);
    
        // Account for potential negative values
        const x0 = xMin > 0 ? 0 : 0-xMin;
        const y0 = yMin > 0 ? 0 : 0-yMin;

        // Create y axis
        context.moveTo(startX + x0*xScale, startY);
        context.lineTo(startX + x0*xScale, startY + height);

        // Create x axis
        context.moveTo(startX, startY + height - (yMin > 0 ? 0: 0 - yMin) * yScale);
        context.lineTo(startX + width, startY + height - (yMin > 0 ? 0 : 0 - yMin) * yScale);

        context.strokeStyle = 'black';
        context.stroke();
        
        // Create the y axis ticks
        const yTickCount = tickNumber; 
        context.font = '10px Arial'; 
        for (let i = 0; i <= yTickCount; i++) {
            const tickY = startY + height - (yMin + i * (yMax - yMin) / yTickCount - yMin) * yScale;
            context.beginPath();
            context.moveTo(startX + x0 * xScale - 5, tickY); 
            context.lineTo(startX + x0 * xScale, tickY); 
            context.stroke();
            let txt = (yMin + i * (yMax - yMin) / yTickCount).toFixed(1);
            const textWidth = context.measureText(txt).width;
            context.fillText(txt, startX + x0 * xScale - (textWidth) - 7, tickY + 2.8); 
        }

        // Create the x axis ticks
        const xTickCount = tickNumber; 
        const xTickInterval = width / xTickCount;
        for (let i = 0; i <= xTickCount; i++) {
            const tickX = startX + i * xTickInterval;
            context.beginPath();
            context.moveTo(tickX, startY + height - y0 * yScale); 
            context.lineTo(tickX, startY + height - y0 * yScale + 5); 
            context.stroke();
            let txt = (xMin + i * (xMax - xMin) / xTickCount).toFixed(1);
            const textWidth = context.measureText(txt).width;
            context.fillText(txt, tickX - (textWidth/2), startY + height - y0 * yScale + 15); 
        }
    },

    createScatterPlot(startXFull: number, startYFull: number, xCoordinates: number[], yCoordinates: number[], fullWidth: number, fullHeight: number, color: string, tickNumber: number) {
        // Reset the canvas
        canvas.width = canvas.width

        // Create the padding
        const width = fullWidth - 85;
        const height = fullHeight - 70;

        const addWidth = 50;
        const addHeight = 35;

        // Calculate scales
        const xMin = Math.min(...xCoordinates);
        const yMin = Math.min(...yCoordinates);
        const xScale = width / (Math.max(...xCoordinates) - xMin);
        const yScale = height / (Math.max(...yCoordinates) - yMin);

        // Create the axes and axis ticks
        this.createGraph(startXFull, startYFull, xCoordinates, yCoordinates, fullWidth, fullHeight, tickNumber);

        // Draw the scatter plot dots
        context.fillStyle = color;
        for (let i = 0; i < xCoordinates.length; i++) {
            const canvasX = xCoordinates[i] * xScale - xMin * xScale;
            const canvasY = height - yCoordinates[i] * yScale + yMin * yScale;
            context.beginPath();
            context.arc(canvasX + addWidth, canvasY + addHeight, 5, 0, Math.PI * 2);
            context.fill();
        }
        
        return context.getImageData(startXFull, startYFull, fullWidth, fullHeight);
    }, 

    createLineGraph(startXFull: number, startYFull: number, xCoordinates: number[], yCoordinates: number[], fullWidth: number, fullHeight: number, color: string, tickNumber: number) {
        // Resetting the canvas
        canvas.width = canvas.width
    
        // Create padding
        const width = fullWidth - 85;
        const height = fullHeight - 70;
    
        const startX = startXFull + 50;
        const startY = startYFull + 35;
    
        // Calculate scales
        const xMin = Math.min(...xCoordinates);
        const yMin = Math.min(...yCoordinates);
        const xMax = Math.max(...xCoordinates);
        const yMax = Math.max(...yCoordinates);
        const xScale = width / (xMax - xMin);
        const yScale = height / (yMax - yMin);
    
        // Create the axes and axis ticks
        this.createGraph(startXFull, startYFull, xCoordinates, yCoordinates, fullWidth, fullHeight, tickNumber);
    
        // Draw the lines
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(startX + (xCoordinates[0] - xMin) * xScale, startY + height - (yCoordinates[0] - yMin) * yScale);
        for (let i = 1; i < xCoordinates.length; i++) {
            context.lineTo(startX + (xCoordinates[i] - xMin) * xScale, startY + height - (yCoordinates[i] - yMin) * yScale);
        }
        context.stroke();
    
        return context.getImageData(startXFull, startYFull, fullWidth, fullHeight);
    },
    createBarChart(startXFull: number, startYFull: number, xCategories: any[], yCoordinates: number[], fullWidth: number, fullHeight: number, color: string, tickNumber: number) {
        // Resetting the canvas
        canvas.width = canvas.width

        // Create padding
        const width = fullWidth - 85;
        const height = fullHeight - 70;
    
        const startX = startXFull + 50;
        const startY = startYFull + 35;
    
        // Calculating scales
        const yMin = Math.min(...yCoordinates);
        const yMax = Math.max(...yCoordinates);
        const yScale = height / (yMax - yMin);
    
        const barWidth = width / xCategories.length;
    
        // Draw axes
        context.strokeStyle = 'black';
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(startX, startY + height);
        context.lineTo(startX + width, startY + height);
        context.stroke();
    
        // Draw the bars and labels
        context.lineWidth = 2;
        for (let i = 0; i < xCategories.length; i++) {
            const barX = startX + i * barWidth + barWidth / 4;
            const barY = startY + height - (yCoordinates[i] - yMin) * yScale;
            const barHeight = (yCoordinates[i] - yMin) * yScale;
            const textWidth = context.measureText(xCategories[i]).width;
            context.strokeStyle = 'black';
            context.fillStyle = 'black';
            context.fillText(xCategories[i], barX - (textWidth/2) + (barWidth/4), startY + height + 15);
            context.fillStyle = color;
            context.fillRect(barX, barY, barWidth / 2, barHeight);
        }

        // Create the y axis ticks
        context.fillStyle = 'black';
        const yTickCount = tickNumber;
        context.font = '10px Arial';
        for (let i = 0; i <= yTickCount; i++) {
            const tickY = startY + height - (yMin + i * (Math.max(...yCoordinates) - yMin) / yTickCount - yMin) * yScale;
            context.beginPath();
            context.moveTo(startX - 5, tickY);
            context.lineTo(startX, tickY);
            context.stroke();
            let txt = (yMin + i * (Math.max(...yCoordinates) - yMin) / yTickCount).toFixed(1);
            const textWidth = context.measureText(txt).width;
            context.fillText(txt, startX - (textWidth) - 7, tickY + 2.8);
        }

        return context.getImageData(startXFull, startYFull, fullWidth, fullHeight);
    } 
    
  }
}



