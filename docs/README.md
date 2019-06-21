# React Store

## To generate documentation

#### go to [react-store](https://github.com/toggle-corp/react-store) root folder
    cd react-store

#### run [react-docgen](https://github.com/reactjs/react-docgen) on folders or files you want to generate documentation
    react-docgen components/Visualization/ChordDiagram.js -o ChordDiagram.json

#### run buildDocs script located on docs/scripts folder with generated json
    node docs/scripts/buildDocs.js < ChordDiagram.json

## Components

### Visualization
Visualization components helps to represent data in graphical way.

* [ChordDiagram](components/Visualization/ChordDiagram.md)
* [ClusteredForceLayout](components/Visualization/ClusteredForceLayout.md)
* [ClusterForceLayout](components/Visualization/ClusterForceLayout.md)
* [CollapsibleTree](components/Visualization/CollapsibleTree.md)
* [ColorPalette](components/Visualization/ColorPalette.md)
* [CorrelationMatrix](components/Visualization/CorrelationMatrix.md)
* [Dendrogram](components/Visualization/Dendrogram.md)
* [DonutChart](components/Visualization/DonutChart.md)
* [ForceDirectedGraph](components/Visualization/ForceDirectedGraph.md)
* [FullScreen](components/Visualization/FullScreen.md)
* [GeoReferencedMap](components/Visualization/GeoReferencedMap.md)
* [GoogleOrgChart](components/Visualization/GoogleOrgChart.md)
* [GroupedBarChart](components/Visualization/GroupedBarChart.md)
* [HealthBar](components/Visualization/HealthBar.md)
* [Histogram](components/Visualization/Histogram.md)
* [HorizontalBar](components/Visualization/HorizontalBar.md)
* [LegendItem](components/Visualization/LegendItem.md)
* [Legend](components/Visualization/Legend.md)
* [NewForceDirectedGraph](components/Visualization/NewForceDirectedGraph.md)
* [Organigram](components/Visualization/Organigram.md)
* [OrgChart](components/Visualization/OrgChart.md)
* [ParallelCoordinates](components/Visualization/ParallelCoordinates.md)
* [PieChart](components/Visualization/PieChart.md)
* [RadialDendrogram](components/Visualization/RadialDendrogram.md)
* [Sankey](components/Visualization/Sankey.md)
* [Segment](components/Visualization/Segment.md)
* [SimpleHorizontalBarChart](components/Visualization/SimpleHorizontalBarChart.md)
* [SimpleVerticalBarChart](components/Visualization/SimpleVerticalBarChart.md)
* [SparkLine](components/Visualization/SparkLine.md)
* [SparkLines](components/Visualization/SparkLines.md)
* [StackedBarChart](components/Visualization/StackedBarChart.md)
* [StreamGraph](components/Visualization/StreamGraph.md)
* [SunBurst](components/Visualization/SunBurst.md)
* [TimeSeries](components/Visualization/TimeSeries.md)
* [Tooltip](components/Visualization/Tooltip.md)
* [TreeMap](components/Visualization/TreeMap.md)
* [VerticalBarChart](components/Visualization/VerticalBarChart.md)
* [WordCloud](components/Visualization/WordCloud.md)
* [ZoomableTreeMap](components/Visualization/ZoomableTreeMap.md)
