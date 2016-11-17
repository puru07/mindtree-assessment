import { Component } from '@angular/core';
import { GapiService } from '../services/gapi.service';

import { KnowledgeNode } from '../common/knowledge-node';

export class Node {
  id: string;
  label: string;
}

export class Edge {
  id: string;
  from: string;
  to: string;
}

@Component({
  selector: 'knowledge-graph',
  templateUrl: 'knowledge-graph.component.html',
  styleUrls: ['knowledge-graph.component.scss'],
})
export class KnowledgeGraphComponent {
  knowledgeGraph: any;

  constructor(private gapi_: GapiService) {
  }

  ngAfterViewInit() {
    this.gapi_.loadAllKnowledgeNodes().then(nodes => {
      this.knowledgeGraph = this.loadKnowledgeGraphDrawer_(nodes);
      this.knowledgeGraph.on("click", (params) => this.onGraphClicked_(params));
    });
  }

  private loadKnowledgeGraphDrawer_(knowledgeNodes: KnowledgeNode[]) {
    const knowledgeNodeMap = new Map();
    knowledgeNodes.forEach(knowledgeNode => {
      knowledgeNodeMap.set(knowledgeNode.websafeKey, knowledgeNode);
    });

    const nodes = knowledgeNodes.map((knowledgeNode => {
      return {
        id: knowledgeNode.websafeKey,
        label: knowledgeNode.name,
      }
    }));
    const nodeDataSet = new vis.DataSet(nodes);

    const edges = [];
    knowledgeNodes.forEach(knowledgeNode => {
      if (knowledgeNode.children) {
        knowledgeNode.children.forEach(child => {
          const fromNodeKey = knowledgeNode.websafeKey;
          const toNodeKey = knowledgeNodeMap.get(child).websafeKey;  
          edges.push({
            id: this.createEdgeId(fromNodeKey, toNodeKey),
            from: fromNodeKey,
            to: toNodeKey,
          });
        });
      }
    });
    const edgeDataSet = new vis.DataSet(edges);

    // create a network
    const container = document.getElementById('knowledge-graph-drawer');

    // provide the data in the vis format
    const data = {
        nodes: nodeDataSet,
        edges: edgeDataSet,
    };

    const options = {
      edges: {
        arrows: 'to'
      },

      manipulation: {
        addEdge: (edgeData, callback) => {
          if (edgeData.from !== edgeData.to) {
            edgeData.id = this.createEdgeId(edgeData.from, edgeData.to);
            callback(edgeData);
            this.onAddEdge_(edgeData);
          }
        },

        deleteEdge: (params, callback) => {
          if (!params) {
            return;
          }
          if (params.edges && params.edges.length == 1) {
            this.deleteEdge(params.edges[0]).then(() => callback(params));
          }
        }
      }
    };

    // initialize your network!
    return new vis.Network(container, data, options);
  }

  private createEdgeId(from: string, to: string): string {
    return from + ',' + to;
  }

  private onGraphClicked_(params: any) {
    if (!params) {
      return;
    }
    if (params.nodes && params.nodes.length == 1) {
      this.onNodeClicked_(params.nodes[0]);
    } else if (params.edges && params.edges.length == 1) {
      this.onEdgeClicked_(params.edges[0]);
    } else {
      this.knowledgeGraph.addEdgeMode();
    }
  }

  private onNodeClicked_(nodeKey: String) {
  }

  private onEdgeClicked_(edgeKey: String) {
  }


  private onAddEdge_(edgeData: Edge) {
    this.gapi_.addEdge(edgeData.from, edgeData.to).then(()=>{}, (error) => {
      // TODO(du6): display toast error
      this.knowledgeGraph.selectEdges([edgeData.id]);
      this.knowledgeGraph.deleteSelected();
    });
  }

  private deleteEdge(edgeId: string): Promise<any> {
    const nodeKeys = edgeId.split(',');
    return this.gapi_.deleteEdge(nodeKeys[0], nodeKeys[1]);
  }
}