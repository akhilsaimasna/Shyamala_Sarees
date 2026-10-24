import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, enquiryHref, validImage, matchesSearch, matchesColour, priceLabel, type StoreProduct } from "../src/components/storefront/catalog.ts";

const products: StoreProduct[] = [
 {id:"1",name:"Maroon Kanchi Silk",slug:"kanchi",price_inr:12000,price_usd:0,category:"Sarees",collection:"Kanchi silk",description:"Wedding weave",images:[],in_stock:true,featured:true,best_seller:false},
 {id:"2",name:"Pink Georgette",slug:"pink",price_inr:4500,price_usd:0,category:"Sarees",collection:"Georgette",description:"Light drape",images:[],in_stock:true,featured:false,best_seller:false},
 {id:"3",name:"Green Cotton",slug:"cotton",price_inr:3000,price_usd:0,category:"Cotton",description:"Daily wear",images:[],in_stock:false,featured:false,best_seller:false},
];
const base = {query:"",collections:[] as string[],colour:"",maxPrice:25000,inStock:false,edit:"all",sort:"featured"};

test("combines search terms, collection and price filters",()=>{
 assert.deepEqual(filterCatalog(products,{...base,query:"PINK drape",collections:["Georgette"],maxPrice:5000}).map(p=>p.id),["2"]);
 assert.equal(filterCatalog(products,{...base,query:"pink",maxPrice:4000}).length,0);
});
test("multiple collections use OR while availability uses AND",()=>{
 assert.deepEqual(filterCatalog(products,{...base,collections:["Georgette","Cotton"],inStock:true}).map(p=>p.id),["2"]);
});
test("sort does not mutate the source catalog",()=>{
 assert.deepEqual(filterCatalog(products,{...base,sort:"price-low"}).map(p=>p.id),["3","2","1"]);
 assert.deepEqual(products.map(p=>p.id),["1","2","3"]);
});
test("under 5000 edit and wedding edit have distinct boundaries",()=>{
 assert.deepEqual(filterCatalog(products,{...base,edit:"budget"}).map(p=>p.id),["2","3"]);
 assert.deepEqual(filterCatalog(products,{...base,edit:"wedding"}).map(p=>p.id),["1"]);
});
test("colour searches the explicit colour or product name",()=>{
 assert.deepEqual(filterCatalog(products,{...base,colour:"Maroon"}).map(p=>p.id),["1"]);
});
test("images permit local and HTTP URLs but reject executable and protocol-relative values",()=>{
 assert.equal(validImage("javascript:alert(1)"),undefined);
 assert.equal(validImage("//unknown.example/image.png"),undefined);
 assert.equal(validImage("/brand/saree.png"),"/brand/saree.png");
 assert.equal(validImage("https://example.test/saree.png"),"https://example.test/saree.png");
});
test("WhatsApp enquiry includes quantity, extended price and confirmation boundary",()=>{
 const url=new URL(enquiryHref([{...products[1],quantity:2}]));
 assert.equal(url.origin+url.pathname,"https://wa.me/919440653443");
 const message=url.searchParams.get("text")!;
 assert.match(message,/Pink Georgette \(2\) × 2/);
 assert.match(message,/9,000/);
 assert.match(message,/before I order/);
});
test("sample enquiries identify themselves instead of implying live inventory",()=>{
 assert.match(new URL(enquiryHref([{...products[0],quantity:1}],true)).searchParams.get("text")!,/sample selections/);
});


test("new arrivals includes inventory collection even without featured flag",()=>{
 const arrival={...products[1],collection:"new-arrivals",featured:false};
 assert.deepEqual(filterCatalog([arrival],{...base,edit:"new"}).map(p=>p.id),["2"]);
});
test("search supports separated terms and Telugu names",()=>{
 const product={...products[0],name_te:"కంచి పట్టు"};
 assert.equal(matchesSearch(product,"silk maroon"),true);
 assert.equal(matchesSearch(product,"కంచి"),true);
 assert.equal(matchesSearch(product,"silk cotton"),false);
});
test("colour uses description words and respects explicit metadata",()=>{
 assert.equal(matchesColour({...products[0],name:"Silk Saree",description:"Green body with gold border"},"Green"),true);
 assert.equal(matchesColour({...products[0],name:"Featured silk",description:""},"Red"),false);
 assert.equal(matchesColour({...products[0],color:"Blue"},"Maroon"),false);
});
test("unknown prices require confirmation and never qualify for a budget",()=>{
 const unknown={...products[0],id:"quote",price_inr:0};
 assert.equal(priceLabel(unknown),"Price on request");
 assert.equal(filterCatalog([unknown],{...base,includeUnpriced:true}).length,1);
 assert.equal(filterCatalog([unknown],{...base,includeUnpriced:true,edit:"budget"}).length,0);
 assert.equal(filterCatalog([unknown],{...base,maxPrice:5000}).length,0);
 for(const sort of ["price-low","price-high"]){
  assert.equal(filterCatalog([unknown,products[1]],{...base,includeUnpriced:true,sort}).at(-1)?.id,"quote");
 }
 const message=new URL(enquiryHref([{...unknown,quantity:2}])).searchParams.get("text")!;
 assert.match(message,/Price on request/);
 assert.doesNotMatch(message,/₹0/);
});
