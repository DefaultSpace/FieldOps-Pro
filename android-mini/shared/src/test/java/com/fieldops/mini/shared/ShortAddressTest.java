package com.fieldops.mini.shared;
import org.junit.Test;
import static org.junit.Assert.*;
public class ShortAddressTest {
    @Test public void prefersStreetAndKeepsNeighborhood(){assertEquals("ahmet sok no3 d5\nGümüşpala",ShortAddress.format("cumhuriyet cad ahmet sok berker apt no3 d5 · Gümüşpala · Avcılar"));}
    @Test public void avenueOnlyAndDistrictRemoved(){assertEquals("Cumhuriyet cad no12 d4\nDenizköşkler",ShortAddress.format("Cumhuriyet Caddesi Berker Apt No: 12 Daire: 4 · Denizköşkler · Avcılar"));}
    @Test public void noSeparatorDoesNotInventNeighborhood(){assertEquals("Ahmet sok no3 d5",ShortAddress.format("Ahmet Sokak No:3 D:5"));}
}
