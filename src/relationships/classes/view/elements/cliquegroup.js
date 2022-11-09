class CliqueGroup {
    #x;
    #y;
    #cliques = [];
    #svg;

    getPos() {
        return {x: this.#x, y: this.#y};
    }

    setPos(pos) {
        this.#x = pos.x;
        this.#y = pos.y;
    }

    addClique(clique) {
        this.#cliques.push(clique);
    }

    draw(cont) {
        this.#svg = document.createElementNS(svgns, 'g');
        let bg = document.createElementNS(svgns, "rect");

        bg.classList.add("clique-group");
        let height = this.#cliques.length / 2 + this.#cliques % 2;
        
        bg.setAttribute("width", CLIQUE_W);
        bg.setAttribute("height", height * CLIQUE_H);
        bg.setAttribute("x", this.#x);
        bg.setAttribute("y", this.#y);
        bg.setAttribute("rx", 15);
        this.#svg.appendChild(bg);
        for(let i = 0; i < this.#cliques.length; i++) {
            let x = ((i % 2) * (CLIQUE_W / 2)) + CLIQUE_W / 4
            let
            this.#svg.appendChild(this.#cliques[i].getChildSVG());
        }

        cont.appendChild(this.#svg);
    }
}