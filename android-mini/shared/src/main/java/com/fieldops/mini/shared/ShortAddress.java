package com.fieldops.mini.shared;

/** Display only: never changes the stored customer address. */
public final class ShortAddress {
    private ShortAddress() {}
    public static String format(String full) {
        String[] parts=full.split("\\s*·\\s*");
        String street=parts[0].trim();
        String area=parts.length>1?parts[1].trim():"";
        // Prefer the street when both an avenue and a street were supplied.
        if(street.matches("(?iu).*\\b(?:sokak|sok|sk)\\b.*"))
            street=street.replaceFirst("(?iu)^.*?\\b(?:caddesi|cadde|cad|cd)\\b\\.?\\s*", "");
        // Drop apartment/building names between the road and building number.
        street=street.replaceFirst("(?iu)(\\b(?:sokak|sok|sk|caddesi|cadde|cad|cd)\\b\\.?).*?(\\bno\\s*[:.]?\\s*\\d)", "$1 $2");
        street=street.replaceAll("(?iu)\\b(?:sokak|sk)\\b\\.?", "sok")
            .replaceAll("(?iu)\\b(?:caddesi|cadde|cd)\\b\\.?", "cad")
            .replaceAll("(?iu)\\bno\\s*[:.]?\\s*", "no")
            .replaceAll("(?iu)\\b(?:daire|d)\\s*[:.]?\\s*(\\d+)", "d$1")
            .replaceAll("\\s+", " ").trim();
        if(street.isEmpty())street="Adres yok";
        // Keep the neighborhood on its own line so long streets cannot hide it.
        return street+(area.isEmpty()?"":"\n"+area);
    }
}
