FROM openjdk:8

ENV SPARK_VERSION=2.4.3
ENV HADOOP_VERSION=2.7
ENV LIVY_VERSION=0.6.0
ENV SPARK_VERSION_STRING=spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}
ENV LIVY_VERSION_STRING=apache-livy-${LIVY_VERSION}-incubating-bin
ENV SPARK_HOME=/spark
ENV LIVY_HOME=/livy

ADD http://apache.mirror.iphh.net/spark/spark-${SPARK_VERSION}/${SPARK_VERSION_STRING}.tgz /
ADD http://ftp.jaist.ac.jp/pub/apache/incubator/livy/${LIVY_VERSION}-incubating/${LIVY_VERSION_STRING}.zip /

RUN tar xzf ${SPARK_VERSION_STRING}.tgz \
	&& mv ${SPARK_VERSION_STRING} ${SPARK_HOME} \
	&& rm ${SPARK_VERSION_STRING}.tgz \
	&& unzip ${LIVY_VERSION_STRING}.zip \
	&& mv ${LIVY_VERSION_STRING} ${LIVY_HOME} \
	&& mkdir ${LIVY_HOME}/logs

COPY livy.conf ${LIVY_HOME}/conf

EXPOSE 8080