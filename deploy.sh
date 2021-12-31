good_to_go=true
[[ -z "${GOOGLE_CLOUD_PROJECT}" ]] && good_to_go=false && echo GOOGLE_CLOUD_PROJECT undefined
[[ -z "${DB_HOST}" ]] && good_to_go=false && echo DB_HOST undefined
[[ -z "${DB_USER}" ]] && good_to_go=false && echo DB_USER undefined
[[ -z "${DB_PASS}" ]] && good_to_go=false && echo DB_PASS undefined
[[ -z "${DB_NAME}" ]] && good_to_go=false && echo DB_NAME undefined
if $good_to_go ; then
  gcloud functions deploy test1 --allow-unauthenticated \
    --trigger-http \
    --runtime nodejs12 \
    --set-env-vars \
    GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT,\
DB_HOST=$DB_HOST,\
DB_USER=$DB_USER,\
DB_PASS=$DB_PASS,\
DB_NAME=$DB_NAME
fi
