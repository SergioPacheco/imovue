#!/bin/bash
# Roda geocode em paralelo (4 processos)
cd "$(dirname "$0")/.."

# Grupo 1: RJ (maior)
python3 -u tools/geocode.py RJ > /tmp/geo_1.log 2>&1 &
P1=$!

# Grupo 2: SP (segundo maior)
python3 -u tools/geocode.py SP > /tmp/geo_2.log 2>&1 &
P2=$!

# Grupo 3: RN RS SE SC
(for uf in RN RS SE SC; do python3 -u tools/geocode.py $uf; done) > /tmp/geo_3.log 2>&1 &
P3=$!

# Grupo 4: RO RR TO PI (pequenos)
(for uf in RO RR TO; do python3 -u tools/geocode.py $uf; done) > /tmp/geo_4.log 2>&1 &
P4=$!

echo "Lançados 4 processos paralelos:"
echo "  PID $P1 → RJ (10492)"
echo "  PID $P2 → SP (2991)"
echo "  PID $P3 → RN RS SE SC (2025)"
echo "  PID $P4 → RO RR TO (50)"
echo ""
echo "Acompanhar: tail -f /tmp/geo_1.log /tmp/geo_2.log /tmp/geo_3.log /tmp/geo_4.log"
echo "Aguardando todos terminarem..."

wait $P1 $P2 $P3 $P4
echo ""
echo "✅ Todos concluídos!"
