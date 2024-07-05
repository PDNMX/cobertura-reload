// @ts-nocheck
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {AmbitoBarChart} from "./ambito-bar-chart"

export const TabsColumnsSistemas = ({ data }: any) => {

    return (
      <>  
        <Tabs defaultValue="SO" className="space-y-4">
          <TabsList>
            <TabsTrigger value="SO">
              Sujetos Obligados 
            </TabsTrigger>
            <TabsTrigger value="OIC">
              Autoridades Resolutoras 
            </TabsTrigger>
          </TabsList>
  
          <TabsContent value="SO" className="space-y-4">
            <AmbitoBarChart/>
          </TabsContent>
  
          <TabsContent value="OIC" className="space-y-4">

          </TabsContent>
        </Tabs>
      </>
    );
  };
