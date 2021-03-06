export class Component {
    private static hidden: string = "hidden";
    static hide(element: HTMLElement) {
        if (!element.classList.contains(this.hidden)) {
            element.classList.add(this.hidden);
        }
    }

    static show(element: HTMLElement) {
        if (element.classList.contains(this.hidden)) {
            element.classList.remove(this.hidden);
        }
    }
    
    static clearContainer(element: HTMLElement){
        while(element.hasChildNodes())
        {
            element.removeChild(element.lastChild);
        }
    }
    
    static changeId(element: HTMLElement, newId: string){
        element.id = newId; 
        return newId;
    }



}
